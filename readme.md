# How many requests had your functions in a period of time

While we were monitoring the performance of our functions, some people requested reports on the number of requests we were handling, broken down by functions and by periods of time.

I tried to do it with Grafana, but it was not possible, maybe because of my inexperience. Then I found out that Prometheus allowed me to make direct queries to their API, and they answered exactly what I needed to know.

```
http://localhost:9090/api/v1/query_range?query=gateway_function_invocation_total&start=2018-07-30T00:00:00.000Z&&end=2018-07-31T00:00:00Z&step=1h
```

As they were occasional reports, I prepared a small online command program to perform the query and format the output.

## Before start
Install dependencies with ```npm i```

If you call the program with no params it will show you some help.
```bash
$ node index.js
Usage: openfaas-function-call-count [options]

Options:

  -V, --version         output the version number
  -s --start <start>    Starting day
  -e --end <end>        End day
  -t --step <step>      Step
  -f --format <format>  Output format [table|json] (default: table)
  -h, --help            output usage information
```

## Query
The ```step``` and ```format``` parameters are optional, but you must provide ```start``` and ```end``` values, both in ```YYYY-MM-DD``` format.

Example:
```bash```
$ node index.js -s '2018-07-30' -e '2018-07-31'

function-calls-count/200 sum=2
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 13:07 | 25           |       |
| 2 | 2018-07-30 14:07 | 27           |     2 |
'---------------------------------------------'

function-calls-count/500 sum=0
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 12:07 | 3            |       |
| 2 | 2018-07-30 13:07 | 3            |     0 |
| 3 | 2018-07-30 14:07 | 3            |     0 |
'---------------------------------------------'
```

Same than above, but in JSON format
```bash
$ node index.js -s '2018-07-30' -e '2018-07-31' -f json
[{"metric":{"__name__":"gateway_function_invocation_total","code":"200","function_name":"function-calls-count","instance":"10.0.0.6:8080","job":"gateway"},"values":[[1532970000,"25"],[1532973600,"27"]]},{"metric":{"__name__":"gateway_function_invocation_total","code":"500","function_name":"function-calls-count","instance":"10.0.0.6:8080","job":"gateway"},"values":[[1532966400,"3"],[1532970000,"3"],[1532973600,"3"]]}]
```

Output as ascii-table, grouped by 3 hour window
```bash
node index.js -s '2018-07-30' -e '2018-07-31' -t 3h

function1/200 sum=119
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 00:07 | 4534         |       |
| 2 | 2018-07-30 03:07 | 4534         |     0 |
| 3 | 2018-07-30 06:07 | 4534         |     0 |
| 4 | 2018-07-30 09:07 | 4580         |    46 |
| 5 | 2018-07-30 12:07 | 4653         |    73 |
'---------------------------------------------'

function2/200 sum=409
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 00:07 | 2000         |       |
| 2 | 2018-07-30 03:07 | 2000         |     0 |
| 3 | 2018-07-30 06:07 | 2001         |     1 |
| 4 | 2018-07-30 09:07 | 2140         |   139 |
| 5 | 2018-07-30 12:07 | 2409         |   269 |
'---------------------------------------------'

function1/500 sum=0
.---------------------------------------------.
|   |     Day/Hour     | Accum. Calls | Calls |
|---|------------------|--------------|-------|
| 1 | 2018-07-30 00:07 | 1            |       |
| 2 | 2018-07-30 03:07 | 1            |     0 |
| 3 | 2018-07-30 06:07 | 1            |     0 |
| 4 | 2018-07-30 09:07 | 1            |     0 |
| 5 | 2018-07-30 12:07 | 1            |     0 |
'---------------------------------------------'
```
