---
title: Everyone wants GPUs. Why are CPUs running short?
summary: As AI moves from producing answers to completing tasks, its bottlenecks shift. Follow an agent's workflow to understand rising CPU demand—and what would make the shortage last.
topic: ai
date: 2026-10-01
featured: 1
---

CPUs are becoming increasingly prominent on AI infrastructure shopping lists.

In late September, reports from industry channels suggested that 2027 production of AMD's sixth-generation EPYC processor, Venice, was already booked, with orders spilling into 2028. AMD has not officially confirmed the claim. Even so, pressure on server CPU supply is attracting attention. [Reported supply constraints](https://www.techtimes.com/articles/328325/20260930/amd-epyc-venice-supply-exhausted-2027-agentic-ai-drives-server-cpu-crunch.htm)

Intel has also signaled a shortage. According to coverage of Splunk .conf26, its CEO said the company could currently meet only about half of customers' CPU demand. That figure cannot be translated directly into a global supply gap. Intel's formal second-quarter disclosure, however, confirmed that demand exceeded available supply and that industry-wide shortages of critical components, including substrates and memory, were expected to persist into 2027. [Coverage of the remarks](https://www.trendforce.com/news/2026/09/16/news-intel-ceo-flags-ai-supply-squeeze-memory-prices-up-5-7x-its-cpus-meet-just-50-of-demand/); [Intel quarterly filing](https://www.sec.gov/Archives/edgar/data/50863/000005086326000157/intc-20260627.htm)

Generating an answer and completing a task make very different demands on computing infrastructure.

**When AI starts executing tasks on people's behalf, the work falling to CPUs grows too.**

![How GPUs and CPUs work together in AI infrastructure](/assets/images/essays/gpu-cpu/01_cover_gpu_cpu_architecture.jpg)

## 1. A faster GPU still has to wait for everything else

Ask a coding agent to fix a bug, and it must do much more than generate a few lines of code.

It needs to read the project, propose a solution, and edit files. Then it must start an environment, compile the code, and run tests. If a test fails, it sends the error back to the model, makes another change, and tries again.

Model computation relies primarily on GPUs; code execution and much of the tool work rely on CPUs. A task moves back and forth between these stages. Delivery speed depends on the entire workflow.

Consider a simplified time budget. Suppose a task originally takes 100 seconds: 90 seconds for model computation and 10 seconds for other steps that cannot, for now, be accelerated.

| Stage | Before the GPU upgrade | After model computation becomes 10× faster |
| --- | ---: | ---: |
| Model computation | 90 seconds | 9 seconds |
| Other steps | 10 seconds | 10 seconds |
| Total time | 100 seconds | 19 seconds |

![Amdahl's law: a 10× speedup in model computation makes the remaining execution steps the main bottleneck](/assets/images/essays/gpu-cpu/02_amdahl_bottleneck_chart.png)

The GPU's portion becomes ten times faster, but the whole task speeds up by only about 5.3 times. Steps that originally accounted for one-tenth of the time now take more than half of it.

That is the constraint described by Amdahl's law: **for a fixed-size task, the benefit of accelerating one part is limited by the work that remains.** The numbers illustrate the mechanism; they are not measurements of an average real-world agent. [NVIDIA CUDA best practices guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html#strong-scaling-and-amdahl-s-law)

A more visible bottleneck does not, by itself, mean CPU demand must rise. If the same number of tasks is processed each day, a GPU upgrade might simply shorten waiting times. Network latency, disk access, and sequential dependencies cannot necessarily be resolved by adding CPUs either.

What drives procurement is the next step: companies use the freed-up GPU capacity to run more tasks at once. More code needs compiling, more tests need running, and more execution environments need starting. Only then does the total amount of CPU work increase.

## 2. One person asks; a team of agents gets to work

In a conversation with a chatbot, people usually pause to read the answer, think, and ask another question. Human reading and judgment place a limit on the frequency of requests.

Given a goal, an agent can run repeated cycles of planning, tool use, checking, and retrying on its own. A single bug-fix request might trigger dozens of tests. A research task might involve numerous web visits and database queries. Several agents can also work on different subtasks simultaneously.

**The user assigns one job; behind the scenes, many rounds of computation and tool use may already be underway.**

![An agent's execution loop alternates between GPU inference and CPU-based tool environments](/assets/images/essays/gpu-cpu/03_agent_execution_loop.jpg)

This expansion remains constrained by budgets, permissions, and success rates. Companies will keep agents running only when the value of the completed work covers the costs of model calls, execution, and review. Once that condition is met, CPU load is no longer determined solely by how often people ask questions. It also depends on how many attempts and execution environments each task requires.

Training agents adds to these demands. To learn to write code and use tools, models must repeatedly attempt tasks and verify the results. Many of those tools and environments run on CPUs.

When NVIDIA introduced the Vera CPU in March 2026, it described a rack with 256 CPUs supporting more than 22,500 concurrent CPU environments. Under the design disclosed by the company, these resources serve execution and training at scale. [Vera CPU announcement](https://nvidianews.nvidia.com/news/nvidia-launches-vera-cpu-purpose-built-for-agentic-ai)

TrendForce also expects CPU-to-GPU ratios in agent deployments to move from the 1:4–1:8 range associated with traditional large-model workloads toward 1:1–1:2. The projection applies to specific deployment scenarios. It reflects the need to rebalance hardware as execution work increases. [TrendForce analysis](https://www.trendforce.com/insights/agentic-ai-cpu-gpu)

## 3. Orders can rise quickly. Production capacity cannot.

Changing demand is colliding with the time required to expand supply.

AMD has announced the production ramp of Venice on TSMC's 2-nanometer process. The next generation of CPUs also needs advanced manufacturing capacity. Wafer fabrication is only the first step: packaging, substrates, memory, and complete server systems must follow. [AMD production-ramp announcement](https://newsroom.amd.com/news/amd-announces-production-ramp-of-next-generation-a/)

A shortage at any stage can prevent a finished chip from becoming a usable server on schedule. Intel's disclosures about substrate and memory constraints show that the supply pressure extends beyond processors themselves. [Intel quarterly filing](https://www.sec.gov/Archives/edgar/data/50863/000005086326000157/intc-20260627.htm)

More execution environments also need more memory capacity and bandwidth, as well as power and cooling. Buying more CPUs therefore adds orders across the supporting infrastructure.

Companies can increase software concurrency quickly. Hardware suppliers must add equipment, improve yields, coordinate components, and validate platforms. Procurement plans and usable computing capacity are separated by a lead time that cannot simply be skipped.

![The server supply chain: wafer fabrication, advanced packaging, substrates, and complete systems](/assets/images/essays/gpu-cpu/04_cpu_supply_chain.jpg)

How long that takes depends on the particular bottleneck. Adjustments to existing production lines, new-product ramps, and supplier expansion can all ease the pressure. Each must be judged by what is actually delivered.

## 4. The same data center may need more CPUs

The scale of CPU demand also depends on what a data center runs.

In a March 2026 presentation, Arm estimated about 30 million CPU cores per gigawatt for a traditional AI data center, potentially rising to 120 million cores in an agentic configuration. This is a vendor's estimate for specific scenarios, including CPU resources adjacent to accelerators—not a universal standard for every data center. [Arm presentation, pages 3–4](https://investors.arm.com/static-files/3ef9667a-16cb-4139-9d9d-bd59dd9f0b3e)

Those two endpoints allow a simple sensitivity analysis.

Suppose newly commissioned AI capacity is G gigawatts, and the share using a CPU-intensive agentic configuration is p. With linear interpolation, the additional core requirement can be written as:

> Additional CPU cores = G × (30 million + 90 million × p)

For a hypothetical 10 gigawatts of new capacity:

| Share with CPU-intensive agentic configurations | CPU cores required | Equivalent at 128 cores per processor |
| --- | ---: | ---: |
| 10% | 390 million | About 3.05 million processors |
| 30% | 570 million | About 4.45 million processors |
| 60% | 840 million | About 6.56 million processors |

![How a change in data-center workloads affects CPU core requirements](/assets/images/essays/gpu-cpu/05_datacenter_cpu_demand_chart.png)

The 10-gigawatt capacity assumption, configuration shares, linear interpolation, and conversion at 128 cores per processor are illustrative. They are not an annual forecast or an industry-average configuration. Nor are cores from different architectures fully interchangeable.

**Even with identical additions to capacity, a change in workloads alone could more than double CPU requirements.**

Estimating a global shortfall would also require accounting for general-purpose server replacement, upgrades to existing AI facilities, and equipment reuse, then comparing that demand with each supplier's effective output. Public data is not yet sufficient to complete that calculation.

Whether new products ramping in 2027 can ease the shortage therefore depends on how much CPU demand per data center rises as supply expands. A judgment about future balance must consider capacity growth, workload mix, and software efficiency together.

## 5. A lasting shortage needs real work for AI to do

Strong bookings must eventually be supported by actual use.

Customers worried about availability may buy early or place duplicate orders. Longer lead times strengthen the incentive to stockpile. If real workloads fail to keep pace, today's bookings may become tomorrow's inventory and cancellations.

Software efficiency can change demand too. Reducing unsuccessful retries, reusing execution environments, and combining queries can lower the CPU resources needed to finish a task. Slower data-center construction would also reduce new purchases.

Three signals are worth watching:

- Are delivery times for comparable server CPUs continuing to lengthen?
- How much revenue growth comes from shipments, and how much from a richer product mix or higher prices?
- Do cloud providers' construction and procurement plans become commissioned capacity and sustained workloads?

Volume and price are particularly easy to confuse. Intel's second-quarter server average selling price rose 48% year over year, while shipments rose 9%. The company attributed the price increase primarily to a higher-end product mix. Rapid revenue growth need not mean equally rapid growth in CPU units sold, and cannot be converted directly into a market shortfall. [Intel quarterly filing](https://www.sec.gov/Archives/edgar/data/50863/000005086326000157/intc-20260627.htm)

The renewed attention to CPUs reflects AI's expanding scope. Once a model can propose more solutions, a system still has to execute code, call tools, read data, and check results. What companies actually buy is a completed job, delivered by all these stages together.

**Whether the CPU shortage lasts ultimately depends on whether the work companies will pay AI to do grows faster than the infrastructure required to deliver it.**
