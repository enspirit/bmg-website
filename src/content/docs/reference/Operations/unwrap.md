---
title: unwrap
---

```ruby
rel.unwrap([:attr])
rel.unwrap([:attr1, :attr2])
```

### Problem

Flatten nested Hash attributes into top-level tuple attributes.

Example: *I have tuples with nested address hashes, and I want to flatten them into individual columns.*

### Description

The `unwrap` operator takes tuples containing Hash-valued attributes and flattens them, promoting the nested keys to top-level attributes. This is the inverse of a wrap operation.

Given a tuple like `{ name: "Alice", address: { city: "London", country: "UK" } }`, unwrapping the `:address` attribute produces `{ name: "Alice", city: "London", country: "UK" }`.

Multiple attributes can be unwrapped in a single operation by passing an array of attribute names.

### Requirements

The specified attributes must contain Hash values.

### Examples

#### Basic unwrap

```ruby
wrapped = Bmg::Relation.new([
  { id: 1, name: "Alice", address: { city: "London", country: "UK" } },
  { id: 2, name: "Bob", address: { city: "Paris", country: "France" } },
  { id: 3, name: "Carol", address: { city: "Berlin", country: "Germany" } }
])

wrapped.unwrap([:address]).to_a

=>
[{:id=>1, :name=>"Alice", :city=>"London", :country=>"UK"},
 {:id=>2, :name=>"Bob", :city=>"Paris", :country=>"France"},
 {:id=>3, :name=>"Carol", :city=>"Berlin", :country=>"Germany"}]
```

#### Unwrapping autowrap results

`unwrap` is commonly used to flatten results from `autowrap`:

```ruby
# Data with naming convention (e.g., from a SQL join)
flat = Bmg::Relation.new([
  { id: 1, name: "Order 1", customer_id: 100, customer_name: "Alice" },
  { id: 2, name: "Order 2", customer_id: 101, customer_name: "Bob" }
])

# Autowrap creates nested structure
nested = flat.autowrap
nested.to_a

=>
[{:id=>1, :name=>"Order 1", :customer=>{:id=>100, :name=>"Alice"}},
 {:id=>2, :name=>"Order 2", :customer=>{:id=>101, :name=>"Bob"}}]

# Unwrap flattens it back
nested.unwrap([:customer]).to_a

=>
[{:id=>1, :name=>"Order 1", :customer_id=>100, :customer_name=>"Alice"},  # Note: keys are merged
 {:id=>2, :name=>"Order 2", :customer_id=>101, :customer_name=>"Bob"}]
```

#### Multiple unwrap

Flatten multiple nested attributes at once:

```ruby
data = Bmg::Relation.new([
  {
    id: 1,
    shipping: { city: "London", zip: "SW1" },
    billing: { city: "Manchester", zip: "M1" }
  }
])

data.unwrap([:shipping, :billing]).to_a

=>
[{:id=>1, :city=>"Manchester", :zip=>"M1"}]  # Note: billing overwrites shipping
```

**Warning**: When unwrapping multiple attributes with overlapping keys, later attributes overwrite earlier ones.

### Comparison with ungroup

`unwrap` and `ungroup` both flatten nested data, but they work differently:

| Operator | Input | Output |
|----------|-------|--------|
| `unwrap` | Hash attribute `{a: {x: 1, y: 2}}` | Flat tuple `{x: 1, y: 2}` (1 tuple out) |
| `ungroup` | Relation attribute `{a: [{x: 1}, {x: 2}]}` | Multiple tuples (N tuples out) |

- Use `unwrap` for Hash/object attributes (one-to-one flattening)
- Use `ungroup` for Relation/array attributes (one-to-many flattening)

### Handling nil values

If the attribute to unwrap is `nil`, the unwrap merges an empty hash:

```ruby
data = Bmg::Relation.new([
  { id: 1, extra: { foo: "bar" } },
  { id: 2, extra: nil }
])

data.unwrap([:extra]).to_a

=>
[{:id=>1, :foo=>"bar"},
 {:id=>2}]  # nil unwraps to nothing
```
