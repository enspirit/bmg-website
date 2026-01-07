---
title: matching
---

```ruby
left.matching(right, [:a, :b, ...])
left.matching(right, :a => :x, :b => :y, ...)
```

### Problem

Filter tuples from one relation to keep only those that have a match in another relation.

Example: *Which suppliers have supplied at least one part?*

### Description

The `matching` operator performs a semi-join. It filters the left relation to keep only tuples that have at least one matching tuple in the right relation, based on the specified join attributes.

Unlike a regular `join`, `matching` does not add any attributes from the right relation to the result. The result's heading is identical to the left relation's heading.

This is useful when you want to filter based on the existence of related data, without actually including that related data in the result.

The first variant specifies the names of attributes used for matching when they have the same names in both relations.

The second variant uses a hash to match attributes with different names (left attribute => right attribute).

### Requirements

The specified attributes must exist in the respective relations.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in these examples.*

#### Basic matching

Find all suppliers who have supplied at least one part:

```ruby
suppliers.matching(supplies, [:sid]).to_a

=>
[{:sid=>"S1", :name=>"Smith", :status=>20, :city=>"London"},
 {:sid=>"S2", :name=>"Jones", :status=>10, :city=>"Paris"},
 {:sid=>"S3", :name=>"Blake", :status=>30, :city=>"Paris"},
 {:sid=>"S4", :name=>"Clark", :status=>20, :city=>"London"}]
```

Note that S5 (Adams) is not included because there are no supplies from S5 in the supplies relation.

#### Matching on city

Find suppliers located in cities where parts are manufactured:

```ruby
suppliers.matching(parts, [:city]).to_a

=>
[{:sid=>"S1", :name=>"Smith", :status=>20, :city=>"London"},
 {:sid=>"S2", :name=>"Jones", :status=>10, :city=>"Paris"},
 {:sid=>"S3", :name=>"Blake", :status=>30, :city=>"Paris"},
 {:sid=>"S4", :name=>"Clark", :status=>20, :city=>"London"}]
```

S5 (Adams, Athens) is excluded because no parts are manufactured in Athens.

##### Generated SQL

```sql
SELECT `t1`.`sid`, `t1`.`name`, `t1`.`status`, `t1`.`city`
FROM `suppliers` AS 't1'
WHERE EXISTS (
  SELECT 1 FROM `supplies` AS 't2'
  WHERE `t1`.`sid` = `t2`.`sid`
)
```

### Comparison with join

The key difference between `matching` and `join`:

- `join` returns combined tuples from both relations
- `matching` returns only tuples from the left relation (filtering based on existence in right)

```ruby
# join returns combined attributes (one row per match)
suppliers.join(supplies, [:sid]).project([:sid, :pid]).to_a
=> [{:sid=>"S1", :pid=>"P1"}, {:sid=>"S1", :pid=>"P2"}, {:sid=>"S1", :pid=>"P3"}, ...]

# matching returns only left attributes (one row per left tuple)
suppliers.matching(supplies, [:sid]).project([:sid, :name]).to_a
=> [{:sid=>"S1", :name=>"Smith"}, {:sid=>"S2", :name=>"Jones"}, ...]
```
