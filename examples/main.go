package main

import (
	"fmt"
	"time"
)

func main() {

	lineCount := 10

	numbers := []int{10, 20, 30, 40}
	for index, value := range numbers {
		fmt.Printf("Index: %d, Value: %d\n", index, value)
	}

	lineCount = 17
	time.Sleep(1000 * time.Second)

	message := "Hello World"
	for i, r := range message {
		fmt.Printf("Character at index %d: %c\n", i, r)
	}

	lineCount = 25
	fmt.Println("Done")
	time.Sleep(1000 * time.Second)
	fmt.Println(lineCount)
}
