---
title: summarize
---

```ruby
rel.summarize([:a, :b, ...], x: :sum, y: :max, ...)
rel.summarize([:a, :b, ...], x: -> (t,m) { m ? (m + t[:x]) : t[:x] } )
```
### Problem

Place tuples in groups and calculate aggregate values for each group.

Example: *For every city where we have stores, how big is the total revenue per city?*

### Description

The first argument specifies attributes to group by, the second argument is a hash with attribute names as keys and aggregation operations as values.

Like the [`group`](/reference/Operations/group) operation, `summarize` uses a number of *grouping attributes* to slice up the input relation. However, `summarize` does not create a nested relation. Instead, `summarize` extends the output relation with one or several attributes containing *aggregated values* computed over tuples that [match](/reference/Operations/matching) the grouping tuples on all their attributes. (An important difference: while the attributes passed to `group` are the *grouped attributes*, `summarize` expects the *grouping attributes*.)

A simple implementation of the count aggregation might look like this:

```ruby
rel.project(grouping_attrs)
   .extend(
     nested: -> (tuple) { rel.matching(tuple.to_relation, grouping_attrs) }
   )
   .extend(
     count: -> (tuple) { tuple[:nested].count }
   )
   .allbut([:nested])
```

Let's see how this works step by step. We start with the `supplies` relations (described in the [Overview page](/reference/overview)):

We now want to know, *How many products does each supplier stock, and what is the total quantity of items in stock for each supplier?*.

First we project on the `sid` attribute:

| sid |
|-----|
| S1  |
| S2  |
| S3  |
| S4  |

Then we extend by the matching tuples from the original `supplies`:

```
+------+------------------------+
| :pid | :matching              |
+--------+----------------------+
| S1   | +------+------+------+ |
|      | | :sid | :pid | :qty | |
|      | +------+------+------+ |
|      | | S1   | P1   | 300  | |
|      | | S1   | P2   | 200  | |
|      | | S1   | P3   | 400  | |
|      | | S1   | P4   | 200  | |
|      | | S1   | P5   | 100  | |
|      | | S1   | P6   | 100  | |
|      | +------+------+------+ |
|------+------------------------+
| S2   | +------+------+------+ |
|      | | :sid | :pid | :qty | |
|      | +------+------+------+ |
|      | | S2   | P1   | 300  | |
|      | | etc  | etc  | etc  | |
+--------+----------------------+
```

And then we can extend the relation with count (number of different products) and the total quantity (the sum of `qty` in each group):

| sid | count | sum  |
|-----|-------|------|
| S1  | 6     | 1300 |
| S2  | 2     |  700 |
| S3  | 1     |  200 |
| S4  | 3     |  900 |

This result can be obtained through Bmg like this:

`supplies.summarize([:sid], :pid => :count, :qty => :sum)`

(But note that the aggregate attributes will be named `:pid` and `:qty` instead of `count` and `sum`.)

### Requirements

### Supported aggregation operations

Each of the the aggregation operations below operates on values taken from a single attribute of the tuples in a nested relation, as described above.

Only some of the operations can be compiled to SQL, as indicated in the table below. To understand how mixing compilable and non-combinable operations works, see the [With a SQL database backend](/usage/with-rdbms) page.

| Name           | SQL? | Numerical? | Description                               |
|----------------|------|------------|-------------------------------------------|
| avg            | ✔    | ✔          | Numerical average |
| collect        | --   |            | Creates an array containing all values (including duplicates) |
| concat         | --   |            | String concatenation |
| count          | ✔    |            | Numer of values (including duplicates) |
| distinct       | --   |            | Like `collect, with duplicates removed |
| distinct_count | ✔    |            | Like `count`, but duplicates not counted |
| first          | --   |            | ??? |
| last           | --   |            | ??? |
| max            | ✔    |            | picks out the largest value |
| min            | ✔    |            | picks out the largest value |
| multiple       | --   |            | ??? |
| percentile     | --   | ✔          | ? |
| stddev         | --   | ✔          | ? |
| sum            | ✔    | ✔          | The sum of all values |
| value_by       | --   |            | ? |
| variance       | --   | ✔          | ? |

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in this example.*

```ruby
supplies.summarize([:sid], qty: :sum).to_a

=> [{:sid=>"S1", :qty=>1300},
    {:sid=>"S2", :qty=>700},
    {:sid=>"S3", :qty=>200},
    {:sid=>"S4", :qty=>900}]
```

##### Generated SQL

```sql
SELECT `t1`.`sid`, sum(`t1`.`qty`) AS 'qty'
FROM `supplies` AS 't1'
GROUP BY `t1`.`sid`
```

