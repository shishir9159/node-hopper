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

	// go func() {
	// 	cmd := exec.Command("dlv", "exec", "./myapp",
	// 		"--headless",
	// 		"--listen=:8080",
	// 		"--api-version=2",
	// 		"--log",
	// 	)

	// 	cmd.Stdout = os.Stdout
	// 	cmd.Stderr = os.Stderr

	// 	if err := cmd.Start(); err != nil {
	// 		fmt.Println(err)
	// 		log.Fatal(err)
	// 	}
	// }()

	client := rpc2.NewClient("localhost:8080")
	defer func(client *rpc2.RPCClient, cont bool) {
		err := client.Disconnect(cont)
		if err != nil {
			fmt.Println(err)
			log.Fatal(err)
		}
	}(client, true)

	state, err := client.GetState()
	if err != nil {
		log.Fatalf("Failed to get state: %v", err)
	}
	fmt.Printf("Current state: %s\n", state.CurrentThread.BreakpointInfo)

	goroutines, count, err := client.ListGoroutines(1, 10)
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	fmt.Printf("Active goroutine count: %d\n", count)
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
