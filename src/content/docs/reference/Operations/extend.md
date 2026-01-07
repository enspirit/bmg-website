---
title: extend
---

```ruby
rel.extend(b: :a)
rel.extend(b: ->(t) { t[:a] * 2 })
rel.extend(b: :a, c: ->(t) { t[:a] + t[:b] })
```

### Problem

Add new computed attributes to a relation based on existing attributes.

Example: *I want to display the full name of each customer, computed from their first and last names.*

### Description

Creates a new relation by adding new attributes to each tuple. The values of the new attributes are computed from existing attribute values.

The extension is specified as a hash where:
- Keys are the names of the new attributes to add
- Values specify how to compute the attribute:
  - A **Symbol** copies the value from an existing attribute (e.g., `b: :a` copies the value of `:a` to `:b`)
  - A **Proc/Lambda** computes the value from the tuple (e.g., `b: ->(t) { t[:a] * 2 }`)

Multiple attributes can be added in a single `extend` call.

### Requirements

- The new attribute names must not already exist in the input relation's heading.
- When using a Symbol, the referenced attribute must exist in the input relation.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in these examples.*

#### Adding a computed attribute

```ruby
parts.extend(heavy: ->(t) { t[:weight] > 15 }).to_a

=>
[{:pid=>"P1", :name=>"Nut", :color=>"Red", :weight=>12.0, :city=>"London", :heavy=>false},
 {:pid=>"P2", :name=>"Bolt", :color=>"Green", :weight=>17.0, :city=>"Paris", :heavy=>true},
 {:pid=>"P3", :name=>"Screw", :color=>"Blue", :weight=>17.0, :city=>"Oslo", :heavy=>true},
 {:pid=>"P4", :name=>"Screw", :color=>"Red", :weight=>14.0, :city=>"London", :heavy=>false},
 {:pid=>"P5", :name=>"Cam", :color=>"Blue", :weight=>12.0, :city=>"Paris", :heavy=>false},
 {:pid=>"P6", :name=>"Cog", :color=>"Red", :weight=>19.0, :city=>"London", :heavy=>true}]
```

#### Copying an attribute

```ruby
suppliers.extend(location: :city).project([:sid, :name, :location]).to_a

=>
[{:sid=>"S1", :name=>"Smith", :location=>"London"},
 {:sid=>"S2", :name=>"Jones", :location=>"Paris"},
 {:sid=>"S3", :name=>"Blake", :location=>"Paris"},
 {:sid=>"S4", :name=>"Clark", :location=>"London"},
 {:sid=>"S5", :name=>"Adams", :location=>"Athens"}]
```

#### Multiple extensions

```ruby
supplies
  .extend(
    double_qty: ->(t) { t[:qty] * 2 },
    supply_key: ->(t) { "#{t[:sid]}-#{t[:pid]}" }
  )
  .project([:supply_key, :qty, :double_qty])
  .restrict(Predicate.gt(:qty, 300))
  .to_a

=>
[{:supply_key=>"S1-P3", :qty=>400, :double_qty=>800},
 {:supply_key=>"S2-P2", :qty=>400, :double_qty=>800},
 {:supply_key=>"S4-P5", :qty=>400, :double_qty=>800}]
```

##### Generated SQL

Extensions using lambdas are not compiled to SQL and are evaluated in memory.
