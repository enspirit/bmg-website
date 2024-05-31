---
title: rename
---

```ruby
rel.rename(:a => :x, :b => :y, ...])
```

### Problem

Rename one or several attributes.

Example: *I want the product list, but `pid` should be called `product_id` instead.*

### Description

Creates a new relation identical with the input, except with any number of attributes renamed.

### Requirements

The specified attributes must be part of the input relation's header.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in this example.*

```ruby
suppliers.rename(:sid => :supplier_id).to_a

=>
[{:supplier_id=>"S1", :name=>"Smith", :status=>20, :city=>"London"},
 {:supplier_id=>"S2", :name=>"Jones", :status=>10, :city=>"Paris"},
 {:supplier_id=>"S3", :name=>"Blake", :status=>30, :city=>"Paris"},
 {:supplier_id=>"S4", :name=>"Clark", :status=>20, :city=>"London"},
 {:supplier_id=>"S5", :name=>"Adams", :status=>30, :city=>"Athens"}]
```

##### Generated SQL

```sql
SELECT `t1`.`sid` AS 'supplier_id',
       `t1`.`name`,
       `t1`.`status`,
       `t1`.`city`
FROM `suppliers` AS 't1'
```
