import asyncio
import time
import heapq
from typing import Callable, Awaitable


class TaskScheduler:
    def __init__(self):
        self.tasks = []
        self.event = asyncio.Event()
        self.counter = 0

    def schedule_task(
        self,
        delay_seconds: float,
        task_fn: Callable[[], Awaitable[None]]
    ):
        run_at = time.monotonic() + delay_seconds

        # counter prevents comparison between functions
        heapq.heappush(
            self.tasks,
            (run_at, self.counter, task_fn)
        )

        self.counter += 1
        self.event.set()

    async def run(self):
        while True:
            if not self.tasks:
                self.event.clear()
                await self.event.wait()
                continue

            run_at, _, task_fn = self.tasks[0]

            delay = run_at - time.monotonic()

            if delay > 0:
                self.event.clear()

                try:
                    # Wake either when:
                    # 1. next task becomes due
                    # 2. a new earlier task is added
                    await asyncio.wait_for(
                        self.event.wait(),
                        timeout=delay
                    )
                    continue
                except asyncio.TimeoutError:
                    pass

            heapq.heappop(self.tasks)

            # Don't block scheduler
            asyncio.create_task(task_fn())