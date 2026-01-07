---
title: constants
---

```ruby
rel.constants(status: "active")
rel.constants(version: 1, source: "api")
```

### Problem

Add fixed-value attributes to every tuple in a relation.

Example: *I want to tag all records from a particular data source with a constant identifier.*

### Description

The `constants` operator extends each tuple with new attributes that have the same value for every tuple. This is a specialized form of `extend` optimized for static values rather than computed ones.

Unlike `extend`, which can compute values from other attributes, `constants` simply merges the provided hash into each tuple. This makes it more efficient when you just need to add fixed metadata or tags.

### Requirements

No special requirements. Works on any relation.

### Examples

#### Adding a single constant

```ruby
data = Bmg::Relation.new([
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
])

data.constants(active: true).to_a

=>
[{:id=>1, :name=>"Alice", :active=>true},
 {:id=>2, :name=>"Bob", :active=>true}]
```

#### Multiple constants

```ruby
records = Bmg::Relation.new([
  { id: 1, value: 100 },
  { id: 2, value: 200 }
])

records.constants(
  source: "import",
  version: 2,
  processed_at: "2024-01-15"
).to_a

=>
[{:id=>1, :value=>100, :source=>"import", :version=>2, :processed_at=>"2024-01-15"},
 {:id=>2, :value=>200, :source=>"import", :version=>2, :processed_at=>"2024-01-15"}]
```

#### Tagging data from different sources

```ruby
# Combine data from different sources with source tags
api_data = api_relation.constants(source: "api")
file_data = file_relation.constants(source: "file")
db_data = db_relation.constants(source: "database")

combined = api_data.union(file_data).union(db_data)
```

#### With restrict optimization

The `constants` operator optimizes restrictions that reference the constant attributes:

```ruby
data = Bmg::Relation.new([
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
])

# This efficiently filters based on the constant
data
  .constants(status: "active")
  .restrict(status: "active")  # Pushed down efficiently
  .to_a
```

### Comparison with extend

| Operator | Use case | Values |
|----------|----------|--------|
| `constants` | Add fixed metadata | Same value for all tuples |
| `extend` | Compute new attributes | Different value per tuple |

```ruby
# constants: same value everywhere
rel.constants(version: 1)

# extend: computed per tuple
rel.extend(doubled: ->(t) { t[:value] * 2 })
```

Use `constants` when adding static values - it's simpler and may be more efficient than `extend` with a constant lambda.
