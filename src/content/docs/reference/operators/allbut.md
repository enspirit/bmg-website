---
title: allbut
---

```ruby
rel.allbut([:a, :b, ...])
```

### Problem

Remove some attributes from a relation (this might cause some tuples to become duplicates of others and thus be removed).

Example: *What are the different T-shirt variants we stock, if we disregard colors?*

### Description

Identical to [`project`](/reference/operators/project) except that it keeps all attributes *except* those specified in the argument.

### Requirements

The specified attributes must be part of the input relation's heading.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in this example.*

```ruby
suppliers.allbut([:city]).to_a
=>
[{:sid=>"S1", :name=>"Smith", :status=>20},
 {:sid=>"S2", :name=>"Jones", :status=>10},
 {:sid=>"S3", :name=>"Blake", :status=>30},
 {:sid=>"S4", :name=>"Clark", :status=>20},
 {:sid=>"S5", :name=>"Adams", :status=>30}]
```

##### Generated SQL

```sql
SELECT DISTINCT `t1`.`city`
FROM `suppliers` AS 't1'
```

