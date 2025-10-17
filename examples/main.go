package main

import "fmt"

func main() {

	numbers := []int{10, 20, 30, 40}
	for index, value := range numbers {
		fmt.Printf("Index: %d, Value: %d\n", index, value)
	}

	message := "Hello World"
	for i, r := range message {
		fmt.Printf("Character at index %d: %c\n", i, r)
	}

		
}