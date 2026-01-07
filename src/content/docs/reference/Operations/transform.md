---
title: transform
---

```ruby
rel.transform(attr: :upcase)
rel.transform(attr: ->(v) { v * 2 })
rel.transform(attr: Integer)
rel.transform(:downcase)
rel.transform { |v| v.to_s }
```

### Problem

Modify existing attribute values in place using transformations.

Example: *I want to normalize all string values to uppercase, or convert all numeric strings to integers.*

### Description

The `transform` operator modifies existing attribute values (unlike `extend` which adds new attributes). It supports several transformation styles:

**Per-attribute transformation** (Hash):
- `attr: :method` - Call a method on the value (e.g., `:upcase`, `:to_s`)
- `attr: Class` - Parse/convert to a class (e.g., `Integer`, `Float`, `Date`)
- `attr: ->(v) { ... }` - Apply a lambda to the value
- `attr: { old => new }` - Map values using a lookup hash
- `Class => transformer` - Apply transformation to all attributes of that class

**All-attributes transformation** (Symbol/Proc):
- `:method` - Call method on every attribute value
- `->(v) { ... }` - Apply lambda to every attribute value

### Requirements

No special requirements. Works on any relation.

### Examples

#### Transform specific attributes

```ruby
data = Bmg::Relation.new([
  { id: 1, name: "alice", email: "ALICE@EXAMPLE.COM" },
  { id: 2, name: "bob", email: "BOB@EXAMPLE.COM" }
])

data.transform(name: :capitalize, email: :downcase).to_a

=>
[{:id=>1, :name=>"Alice", :email=>"alice@example.com"},
 {:id=>2, :name=>"Bob", :email=>"bob@example.com"}]
```

#### Type conversion

Convert string values to proper types:

```ruby
csv_data = Bmg::Relation.new([
  { id: "1", price: "19.99", quantity: "5" },
  { id: "2", price: "29.99", quantity: "3" }
])

csv_data.transform(
  id: Integer,
  price: Float,
  quantity: Integer
).to_a

=>
[{:id=>1, :price=>19.99, :quantity=>5},
 {:id=>2, :price=>29.99, :quantity=>3}]
```

#### Lambda transformation

```ruby
orders = Bmg::Relation.new([
  { id: 1, total: 100, discount: 0.1 },
  { id: 2, total: 200, discount: 0.2 }
])

orders.transform(
  total: ->(v) { v.round(2) },
  discount: ->(v) { "#{(v * 100).to_i}%" }
).to_a

=>
[{:id=>1, :total=>100, :discount=>"10%"},
 {:id=>2, :total=>200, :discount=>"20%"}]
```

#### Transform all attributes

Apply the same transformation to every attribute:

```ruby
data = Bmg::Relation.new([
  { a: "hello", b: "world" }
])

# Using a method symbol
data.transform(:upcase).to_a
=> [{:a=>"HELLO", :b=>"WORLD"}]

# Using a block
data.transform { |v| v.reverse }.to_a
=> [{:a=>"olleh", :b=>"dlrow"}]
```

#### Value mapping

Map specific values to other values:

```ruby
data = Bmg::Relation.new([
  { id: 1, status: "A" },
  { id: 2, status: "I" },
  { id: 3, status: "P" }
])

data.transform(
  status: { "A" => "Active", "I" => "Inactive", "P" => "Pending" }
).to_a

=>
[{:id=>1, :status=>"Active"},
 {:id=>2, :status=>"Inactive"},
 {:id=>3, :status=>"Pending"}]
```

#### Transform by type

Apply transformation to all attributes of a specific type:

```ruby
data = Bmg::Relation.new([
  { id: 1, name: "Alice", score: 95.5, rating: 4.8 }
])

# Round all Float values
data.transform(Float => ->(v) { v.round(1) }).to_a

=>
[{:id=>1, :name=>"Alice", :score=>95.5, :rating=>4.8}]
```

#### Regex extraction

Extract matching portions of strings:

```ruby
data = Bmg::Relation.new([
  { id: 1, email: "alice@example.com" },
  { id: 2, email: "bob@test.org" }
])

data.transform(email: /@(.+)/).to_a

=>
[{:id=>1, :email=>"@example.com"},
 {:id=>2, :email=>"@test.org"}]
```

### Comparison with extend

| Operator | Purpose | Result |
|----------|---------|--------|
| `transform` | Modify existing values | Same attributes, different values |
| `extend` | Add new attributes | Additional attributes |

```ruby
# transform: modifies existing attribute
rel.transform(name: :upcase)
# { name: "alice" } => { name: "ALICE" }

# extend: adds new attribute
rel.extend(upper_name: ->(t) { t[:name].upcase })
# { name: "alice" } => { name: "alice", upper_name: "ALICE" }
```
