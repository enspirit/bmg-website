---
title: minus
---

```ruby
left.minus(right)
```

### Problem

Given two relations with the same heading, remove all of the tuples in one from the other.

Example: *I want all the products except those in the list of discontinued products.*

### Description

The set difference of two relations. The result contains those tuples that are in `left` but not in `right`. 

The result's heading is identical with that of the inputs'.

### Requirements

The headings of the two relations must be identical.

### Example

```ruby
my_purchases = Bmg::Relation.new([
  { product_id: 10, quantity: 2 },
  { product_id: 10, quantity: 4 },
  { product_id: 20, quantity: 1 },
])

your_purchases = Bmg::Relation.new([
  { product_id: 10, quantity: 2 },
  { product_id: 10, quantity: 4 },
  { product_id: 20, quantity: 5 },
  { product_id: 30, quantity: 1 },
])

my_purchases.minus(your_purchases).to_a

=>

[{ product_id: 20, quantity: 1 }]
```

##### Generated SQL

```sql
SELECT `t1`.`product_id`, `t1`.`quantitiy`
FROM `my_purchases` AS 't1'
EXCEPT
SELECT `t1`.`product_id`, `t1`.`quantitiy`
FROM `your_purchases` AS 't1' 
```

Note that the scoping of the table alias `t1` is limited to the respective `SELECT` clauses, which is why the same alias is used in both clauses.
