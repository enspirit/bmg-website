---
title: cross_product 
---

```ruby
left.cross_product(right)
```

### Problem

Find every combination of tuples from two relations.

Example: *Given these sizes and these colors, what are all the different T-shirt variants?*

### Description

The cross product of two relations is produced by combining every tuple from the left relation with every tuple from the right relation.

The result's header contains all attributes from left plus all attributes from right.

### Requirements

The headers of the two relations must not overlap, ie they can have no attributes with the same names.

### Example

```ruby
models = Bmg::Relation.new([
  { style: "slim", color: "red" },
  { style: "slim", color: "blue" },
  { style: "loose", color: "red" },
])

sizes = Bmg::Relation.new([
  { size: "S" },
  { size: "M" },
  { size: "L" }
])

t_shirts = models.cross_product(sizes)

t_shirts.to_a

=> [{:size=>"S", :style=>"slim", :color=>"red"},
   {:size=>"M", :style=>"slim", :color=>"red"},
   {:size=>"L", :style=>"slim", :color=>"red"},
   {:size=>"S", :style=>"slim", :color=>"blue"},
   {:size=>"M", :style=>"slim", :color=>"blue"},
   {:size=>"L", :style=>"slim", :color=>"blue"},
   {:size=>"S", :style=>"loose", :color=>"red"},
   {:size=>"M", :style=>"loose", :color=>"red"},
   {:size=>"L", :style=>"loose", :color=>"red"}]

```

##### Generated SQL

```sql
SELECT `t1`.`style`,
       `t1`.`color`,
       `t2`.`size`
FROM `models` AS 't1'
CROSS JOIN `sizes` AS 't2'"
```

