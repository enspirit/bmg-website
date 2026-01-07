---
title: not_matching
---

```ruby
left.not_matching(right, [:a, :b, ...])
left.not_matching(right, :a => :x, :b => :y, ...)
```

### Problem

Filter tuples from one relation to keep only those that have no match in another relation.

Example: *Which suppliers have not supplied any parts?*

### Description

The `not_matching` operator performs an anti-join. It filters the left relation to keep only tuples that have no matching tuple in the right relation, based on the specified join attributes.

This is the inverse of the `matching` operator. Where `matching` keeps tuples that exist in both relations, `not_matching` keeps tuples from the left that do not exist in the right.

Like `matching`, `not_matching` does not add any attributes from the right relation to the result. The result's heading is identical to the left relation's heading.

The first variant specifies the names of attributes used for matching when they have the same names in both relations.

The second variant uses a hash to match attributes with different names (left attribute => right attribute).

### Requirements

The specified attributes must exist in the respective relations.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in these examples.*

#### Basic not_matching

Find all suppliers who have not supplied any parts:

```ruby
suppliers.not_matching(supplies, [:sid]).to_a

=>
[{:sid=>"S5", :name=>"Adams", :status=>30, :city=>"Athens"}]
```

Only S5 (Adams) is returned because all other suppliers have at least one entry in the supplies relation.

#### Finding unmatched cities

Find suppliers in cities where no parts are manufactured:

```ruby
suppliers.not_matching(parts, [:city]).to_a

=>
[{:sid=>"S5", :name=>"Adams", :status=>30, :city=>"Athens"}]
```

S5 is returned because Athens has no parts manufactured there.

#### Finding orphan records

Find parts that have never been supplied:

```ruby
# Assuming we add a part P7 that has never been supplied
parts_with_orphan = parts.union(
  Bmg::Relation.new([{:pid=>"P7", :name=>"Washer", :color=>"Silver", :weight=>5.0, :city=>"Rome"}])
)

parts_with_orphan.not_matching(supplies, [:pid]).to_a

=>
[{:pid=>"P7", :name=>"Washer", :color=>"Silver", :weight=>5.0, :city=>"Rome"}]
```

##### Generated SQL

```sql
SELECT `t1`.`sid`, `t1`.`name`, `t1`.`status`, `t1`.`city`
FROM `suppliers` AS 't1'
WHERE NOT EXISTS (
  SELECT 1 FROM `supplies` AS 't2'
  WHERE `t1`.`sid` = `t2`.`sid`
)
```

### Comparison with matching

`not_matching` is the logical complement of `matching`:

```ruby
# All suppliers who HAVE supplied parts
suppliers.matching(supplies, [:sid]).to_a
=> [{:sid=>"S1", ...}, {:sid=>"S2", ...}, {:sid=>"S3", ...}, {:sid=>"S4", ...}]

# All suppliers who have NOT supplied parts
suppliers.not_matching(supplies, [:sid]).to_a
=> [{:sid=>"S5", :name=>"Adams", :status=>30, :city=>"Athens"}]
```

Together, `matching` and `not_matching` partition the left relation: every tuple appears in exactly one of the two results.
