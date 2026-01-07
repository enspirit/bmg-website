---
title: left_join
---

```ruby
left.left_join(right, [:a, :b, ...])
left.left_join(right, [:a, :b, ...], default_right_tuple)
left.left_join(right, :a => :x, default_right_tuple)
```

### Problem

Extend tuples from one relation with matching tuples from another relation, keeping all tuples from the left relation even when there is no match.

Example: *I want all customers along with their addresses, including customers who have no address on file.*

### Description

The `left_join` operator performs a left outer join. Like a regular `join`, it combines tuples from two relations based on matching attributes. However, unlike a regular join, `left_join` preserves all tuples from the left relation, even when there is no matching tuple in the right relation.

When a left tuple has no match in the right relation:
- The tuple is still included in the result
- Attributes from the right relation are filled with values from the `default_right_tuple` (or `nil` if not specified)

The `default_right_tuple` parameter is a hash specifying default values for the right relation's attributes when no match is found.

### Requirements

The specified join attributes must exist in the respective relations.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in these examples.*

#### Basic left_join

Join suppliers with cities, keeping all suppliers even if their city is not in the cities table:

```ruby
suppliers.left_join(cities, [:city]).to_a

=>
[{:sid=>"S1", :name=>"Smith", :status=>20, :city=>"London", :country=>"England"},
 {:sid=>"S2", :name=>"Jones", :status=>10, :city=>"Paris", :country=>"France"},
 {:sid=>"S3", :name=>"Blake", :status=>30, :city=>"Paris", :country=>"France"},
 {:sid=>"S4", :name=>"Clark", :status=>20, :city=>"London", :country=>"England"},
 {:sid=>"S5", :name=>"Adams", :status=>30, :city=>"Athens", :country=>"Greece"}]
```

All suppliers are returned, including S5 in Athens which matches with the cities table.

#### With default values

Provide default values for non-matching tuples:

```ruby
# Using a relation where some parts have cities not in the cities table
parts.left_join(cities, [:city], { country: "Unknown" }).to_a

=>
[{:pid=>"P1", :name=>"Nut", :color=>"Red", :weight=>12.0, :city=>"London", :country=>"England"},
 {:pid=>"P2", :name=>"Bolt", :color=>"Green", :weight=>17.0, :city=>"Paris", :country=>"France"},
 {:pid=>"P3", :name=>"Screw", :color=>"Blue", :weight=>17.0, :city=>"Oslo", :country=>"Unknown"},
 {:pid=>"P4", :name=>"Screw", :color=>"Red", :weight=>14.0, :city=>"London", :country=>"England"},
 {:pid=>"P5", :name=>"Cam", :color=>"Blue", :weight=>12.0, :city=>"Paris", :country=>"France"},
 {:pid=>"P6", :name=>"Cog", :color=>"Red", :weight=>19.0, :city=>"London", :country=>"England"}]
```

Note that P3 (Oslo) gets `country: "Unknown"` because Oslo is not in the cities table.

#### Practical example: Orders with optional customer data

```ruby
orders = Bmg::Relation.new([
  { order_id: 1, customer_id: 100, total: 50.00 },
  { order_id: 2, customer_id: 101, total: 75.00 },
  { order_id: 3, customer_id: 999, total: 25.00 },  # customer doesn't exist
])

customers = Bmg::Relation.new([
  { customer_id: 100, name: "Alice" },
  { customer_id: 101, name: "Bob" },
])

orders.left_join(customers, [:customer_id], { name: "Guest" }).to_a

=>
[{:order_id=>1, :customer_id=>100, :total=>50.0, :name=>"Alice"},
 {:order_id=>2, :customer_id=>101, :total=>75.0, :name=>"Bob"},
 {:order_id=>3, :customer_id=>999, :total=>25.0, :name=>"Guest"}]
```

##### Generated SQL

```sql
SELECT `t1`.`pid`,
       `t1`.`name`,
       `t1`.`color`,
       `t1`.`weight`,
       `t1`.`city`,
       COALESCE(`t2`.`country`, 'Unknown') AS `country`
FROM `parts` AS 't1'
LEFT JOIN `cities` AS 't2'
  ON (`t1`.`city` = `t2`.`city`)
```

### Comparison with join

The key difference between `left_join` and `join`:

- `join` (inner join) only returns tuples that have matches in both relations
- `left_join` returns all tuples from the left relation, with NULLs or defaults for non-matching right attributes

```ruby
# Regular join excludes P3 (Oslo not in cities)
parts.join(cities, [:city]).project([:pid, :country]).to_a
=> [{:pid=>"P1", :country=>"England"}, {:pid=>"P2", :country=>"France"}, ...]

# Left join includes P3 with default/nil country
parts.left_join(cities, [:city], {country: "Unknown"}).project([:pid, :country]).to_a
=> [{:pid=>"P1", :country=>"England"}, ..., {:pid=>"P3", :country=>"Unknown"}, ...]
```
