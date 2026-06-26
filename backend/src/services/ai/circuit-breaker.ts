export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly cooldownPeriodMs: number;

  constructor(failureThreshold = 3, cooldownPeriodMs = 30000) {
    this.failureThreshold = failureThreshold;
    this.cooldownPeriodMs = cooldownPeriodMs;
  }

  /**
   * Check if requests are allowed to pass.
   * Returns true if allowed (CLOSED or HALF_OPEN), false if blocked (OPEN).
   */
  public checkCall(): boolean {
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        console.warn(`[Circuit Breaker]: Cooldown period elapsed. Attempting recovery. State: HALF_OPEN.`);
        return true;
      }
      return false; // Circuit is OPEN, fail fast
    }
    return true;
  }

  public recordSuccess(): void {
    if (this.state !== 'CLOSED') {
      console.log(`[Circuit Breaker]: Request succeeded. Resetting state to CLOSED.`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  public recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`[Circuit Breaker]: Consecutive failure recorded (${this.failureCount}). Tripping circuit breaker to OPEN state.`);
    }
  }

  public getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }
}
