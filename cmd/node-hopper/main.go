package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/go-delve/delve/service/api"
	"github.com/go-delve/delve/service/rpc2"
)

func main() {

	go func() {
		cmd := exec.Command("dlv", "exec", "./myapp",
			"--headless",
			"--listen=:8080",
			"--api-version=2",
			"--log",
		)

		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Start(); err != nil {
			log.Fatal(err)
		}
	}()

	client := rpc2.NewClient("localhost:8080")
	defer client.Disconnect(true)

	state, err := conn.GetState()
	if err != nil {
		log.Fatalf("Failed to get state: %v", err)
	}
	fmt.Printf("Current state: %s\n", state.String())

	goroutines, err := client.ListGoroutines()
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	fmt.Println("Active goroutines:")
	for _, g := range goroutines {
		fmt.Printf("ID: %d, CurrentLoc: %s\n", g.ID, g.UserCurrentLoc.Function.Name)
	}

	bp, err := client.CreateBreakpoint(&api.Breakpoint{
		FunctionName: "main.main",
	})
	if err != nil {
		log.Fatalf("set breakpoint: %v", err)
	}
	fmt.Printf("Breakpoint set at: %+v\n", bp)
}
