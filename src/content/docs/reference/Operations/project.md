---
title: project
---

```ruby
rel.project([:a, :b, ...])
```
Creates a new relation with a header whose attributes is a subset of that of the original.

To understand the name, think of a three-dimensional object casting a shadow on a two-dimensional plane. The shadow preserves some of the object's shape. It is a *projection* of the three-dimensional object. In the same way, the `project` operation reduces the dimensionality of a relation.

### Requirements

The specified attributes must be part of the input relation's header.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in this example.*

```ruby
suppliers.project([:city]).to_a

=>
[
 {:city=>"London"},
 {:city=>"Paris"},
 {:city=>"Athens"}
]
```

##### Generated SQL

```sql
SELECT DISTINCT `t1`.`city`
FROM `suppliers` AS 't1'
```
