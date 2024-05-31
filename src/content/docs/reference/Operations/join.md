---
title: join
---

```ruby
left.join(right, [:a, :b, ...])
left.join(right, :a => :x, :b => :y, ...) 
```
### Problem

Extend tuples from one relation with matching tuples from another relation, by comparing their attributes according to a given criterion. 

Example: *I want all customers along with their addresses.*

### Description

The join of two relations is produced by selecting tuples from left and right relations by one or more matching attributes, and for every match, combine the tuples 

The result's header contains all attributes from left plus all attributes from right. 

The first variant specifies the names of attributes used for matching. This is used when the attributes to match on have the same names in both tuples.

The second variant first renames some attributes in right, then uses the renamed attributes for matching.

### Requirements

### Examples

#### Without renaming

*Consult the [Overview page](/reference/overview) for the data model used in this example.*

```ruby
parts.join(cities, [:city]).to_a

=>
[{:pid=>"P1", :name=>"Nut", :color=>"Red", :weight=>12.0, :city=>"London", :country=>"England"},
 {:pid=>"P2", :name=>"Bolt", :color=>"Green", :weight=>17.0, :city=>"Paris", :country=>"France"},
 {:pid=>"P4", :name=>"Screw", :color=>"Red", :weight=>14.0, :city=>"London", :country=>"England"},
 {:pid=>"P5", :name=>"Cam", :color=>"Blue", :weight=>12.0, :city=>"Paris", :country=>"France"},
 {:pid=>"P6", :name=>"Cog", :color=>"Red", :weight=>19.0, :city=>"London", :country=>"England"}]

```

##### Generated SQL

```sql
SELECT `t1`.`pid`,
       `t1`.`name`,
       `t1`.`color`,
       `t1`.`weight`,
       `t1`.`city`,
       `t2`.`country`
FROM `parts` AS 't1'
INNER JOIN `cities` AS 't2'
  ON (`t1`.`city` = `t2`.`city`)"
```

#### With renaming

```ruby
purchases = Bmg::Relation.new([
  { id: 1, product_id: 10, quantity: 2 },
  { id: 2, product_id: 10, quantity: 4 },
  { id: 3, product_id: 20, quantity: 1 },
])

products = Bmg::Relation.new([
  { id: 10, name: "Bananas" },
  { id: 20, name: "Oranges" },
  { id: 30, name: "Apples" },
])

# The id attribute in products is matched against
# the product_id attribute in purchases
purchases.join(products, :product_id => :id).to_a

=>
[{:product_id=>10, :name=>"Bananas", :id=>1, :quantity=>2},
 {:product_id=>10, :name=>"Bananas", :id=>2, :quantity=>4},
 {:product_id=>20, :name=>"Oranges", :id=>3, :quantity=>1}]

```

##### Generated SQL

```sql
SELECT `t1`.`id`,
       `t1`.`product_id`,
       `t1`.`quantity`,
       `t2`.`name`
FROM `purchases` AS 't1'
INNER JOIN `products` AS 't2'
  ON (`t1`.`product_id` = `t2`.`id`)"
```
