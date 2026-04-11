package modules

import (
	"sync"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

// EventBus is a thread-safe pub/sub for BuildEvents.
// Each subscriber gets a channel buffered at 512. If a subscriber falls behind, events are dropped
// for that subscriber only — the deploy pipeline is never blocked.
type EventBus struct {
	mu          sync.RWMutex
	subscribers map[int]chan config.BuildEvent
	nextID      int
}

func newEventBus() *EventBus {
	return &EventBus{subscribers: map[int]chan config.BuildEvent{}}
}

// Subscribe returns a BuildEvent channel and an unsubscribe function.
// The caller must call unsubscribe when done to prevent leaks.
func (b *EventBus) Subscribe() (<-chan config.BuildEvent, func()) {
	b.mu.Lock()
	defer b.mu.Unlock()
	id := b.nextID
	b.nextID++
	ch := make(chan config.BuildEvent, 512)
	b.subscribers[id] = ch
	return ch, func() {
		b.mu.Lock()
		delete(b.subscribers, id)
		b.mu.Unlock()
		close(ch)
	}
}

// Publish sends a BuildEvent to all subscribers. Non-blocking: slow subscribers are skipped.
func (b *EventBus) Publish(event config.BuildEvent) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, ch := range b.subscribers {
		select {
		case ch <- event:
		default:
		}
	}
}
