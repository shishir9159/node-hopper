package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/go-delve/delve/service/api"
	"github.com/go-delve/delve/service/rpc2"
)

// global Delve RPC client; reconnected lazily if the connection drops.
var delveAddr string

// newClient creates a fresh RPC2 client to the Delve headless server.
func newClient() *rpc2.RPCClient {
	return rpc2.NewClient(delveAddr)
}

// BreakpointRequest is the JSON body for POST /breakpoint.
type BreakpointRequest struct {
	// File is the absolute path to the source file **inside the container**.
	// e.g. "/app/main.go"
	File string `json:"file"`
	// Line is the 1-indexed source line number.
	Line int `json:"line"`
	// Name is an optional human-readable label for the breakpoint.
	Name string `json:"name,omitempty"`
}

// corsMiddleware adds permissive CORS headers so the browser-hosted Monaco
// editor (possibly on a different origin) can call this server.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("writeJSON encode error: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// POST /breakpoint
// Body: { "file": "/app/main.go", "line": 17, "name": "optional-label" }
// Sets a line-level breakpoint in the remote Delve session.
func handleSetBreakpoint(w http.ResponseWriter, r *http.Request) {
	var req BreakpointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("invalid JSON body: %v", err))
		return
	}
	if strings.TrimSpace(req.File) == "" {
		writeError(w, http.StatusBadRequest, "field 'file' is required")
		return
	}
	if req.Line <= 0 {
		writeError(w, http.StatusBadRequest, "field 'line' must be a positive integer")
		return
	}

	client := newClient()
	defer func() {
		if err := client.Disconnect(true); err != nil {
			log.Printf("disconnect error: %v", err)
		}
	}()

	bp := &api.Breakpoint{
		File: req.File,
		Line: req.Line,
	}
	if req.Name != "" {
		bp.Name = req.Name
	}

	created, err := client.CreateBreakpoint(bp)
	if err != nil {
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("CreateBreakpoint: %v", err))
		return
	}

	log.Printf("breakpoint set: id=%d file=%s line=%d", created.ID, created.File, created.Line)
	writeJSON(w, http.StatusCreated, created)
}

// DELETE /breakpoint/{id}
// Clears the breakpoint with the given numeric ID.
func handleClearBreakpoint(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("invalid breakpoint id %q", idStr))
		return
	}

	client := newClient()
	defer func() {
		if err := client.Disconnect(true); err != nil {
			log.Printf("disconnect error: %v", err)
		}
	}()

	removed, err := client.ClearBreakpoint(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("ClearBreakpoint: %v", err))
		return
	}

	log.Printf("breakpoint cleared: id=%d file=%s line=%d", removed.ID, removed.File, removed.Line)
	writeJSON(w, http.StatusOK, removed)
}

// GET /breakpoints
// Returns the list of all currently set breakpoints.
func handleListBreakpoints(w http.ResponseWriter, r *http.Request) {
	client := newClient()
	defer func() {
		if err := client.Disconnect(true); err != nil {
			log.Printf("disconnect error: %v", err)
		}
	}()

	bps, err := client.ListBreakpoints(false)
	if err != nil {
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("ListBreakpoints: %v", err))
		return
	}

	writeJSON(w, http.StatusOK, bps)
}

// GET /state
// Returns the current debugger state (paused/running, current thread, etc.).
func handleState(w http.ResponseWriter, r *http.Request) {
	client := newClient()
	defer func() {
		if err := client.Disconnect(true); err != nil {
			log.Printf("disconnect error: %v", err)
		}
	}()

	state, err := client.GetState()
	if err != nil {
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("GetState: %v", err))
		return
	}

	writeJSON(w, http.StatusOK, state)
}

// GET /goroutines
// Returns a page of goroutines from the remote program.
func handleGoroutines(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	start := 1
	count := 50

	if s := q.Get("start"); s != "" {
		if v, err := strconv.Atoi(s); err == nil && v >= 0 {
			start = v
		}
	}
	if c := q.Get("count"); c != "" {
		if v, err := strconv.Atoi(c); err == nil && v > 0 {
			count = v
		}
	}

	client := newClient()
	defer func() {
		if err := client.Disconnect(true); err != nil {
			log.Printf("disconnect error: %v", err)
		}
	}()

	goroutines, total, err := client.ListGoroutines(start, count)
	if err != nil {
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("ListGoroutines: %v", err))
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"goroutines": goroutines,
		"total":      total,
	})
}

func main() {
	delveAddr = os.Getenv("DELVE_ADDR")
	if delveAddr == "" {
		delveAddr = "localhost:40000"
	}

	listenAddr := os.Getenv("LISTEN_ADDR")
	if listenAddr == "" {
		listenAddr = ":8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /breakpoint", handleSetBreakpoint)
	mux.HandleFunc("DELETE /breakpoint/{id}", handleClearBreakpoint)
	mux.HandleFunc("GET /breakpoints", handleListBreakpoints)
	mux.HandleFunc("GET /state", handleState)
	mux.HandleFunc("GET /goroutines", handleGoroutines)

	log.Printf("node-hopper listening on %s  →  Delve at %s", listenAddr, delveAddr)
	if err := http.ListenAndServe(listenAddr, corsMiddleware(mux)); err != nil {
		log.Fatal(err)
	}
}
