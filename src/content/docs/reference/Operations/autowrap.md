---
title: autowrap
---

```ruby
rel.autowrap
rel.autowrap(split: "_")
rel.autowrap(postprocessor: :nil)
```

### Problem

Automatically structure flat tuples into nested objects based on attribute naming conventions.

Example: *I have flat results from a SQL join with columns like `customer_id`, `customer_name`, and I want to nest them into a `customer` object.*

### Description

The `autowrap` operator transforms flat tuples into nested structures by detecting naming patterns. Attributes with names like `prefix_suffix` are automatically grouped under the prefix as a nested Hash.

This is particularly useful when working with:
- Results from SQL joins that produce flat column names
- Data that needs to be serialized to JSON with nested objects
- Denormalized data that should be re-structured

Options:
- `split` - The separator to use for detecting nesting (default: `"_"`)
- `postprocessor` - How to handle all-nil nested objects (from LEFT JOINs):
  - `:none` - Keep as-is (default)
  - `:nil` - Replace `{ x: nil, y: nil }` with `nil`
  - `:delete` - Remove the attribute entirely

### Requirements

No special requirements. Works on any relation.

### Examples

#### Basic autowrap

```ruby
flat = Bmg::Relation.new([
  { id: 1, name: "Order 1", customer_id: 100, customer_name: "Alice", customer_city: "London" },
  { id: 2, name: "Order 2", customer_id: 101, customer_name: "Bob", customer_city: "Paris" }
])

flat.autowrap.to_a

=>
[{:id=>1, :name=>"Order 1", :customer=>{:id=>100, :name=>"Alice", :city=>"London"}},
 {:id=>2, :name=>"Order 2", :customer=>{:id=>101, :name=>"Bob", :city=>"Paris"}}]
```

#### Multi-level nesting

Autowrap supports multiple levels of nesting:

```ruby
deep = Bmg::Relation.new([
  { id: 1, ship_address_city: "London", ship_address_zip: "SW1", ship_address_country_name: "UK" }
])

deep.autowrap.to_a

=>
[{:id=>1, :ship=>{:address=>{:city=>"London", :zip=>"SW1", :country=>{:name=>"UK"}}}}]
```

#### Custom separator

Use a different separator for detecting nesting:

```ruby
data = Bmg::Relation.new([
  { id: 1, "user.name": "Alice", "user.email": "alice@example.com" }
])

data.autowrap(split: ".").to_a

=>
[{:id=>1, :user=>{:name=>"Alice", :email=>"alice@example.com"}}]
```

#### Handling LEFT JOIN noise

When using LEFT JOINs, non-matching rows produce all-nil nested values. The `postprocessor` option handles this:

```ruby
# Simulating LEFT JOIN results where customer 2 has no address
left_join_result = Bmg::Relation.new([
  { id: 1, name: "Alice", address_city: "London", address_zip: "SW1" },
  { id: 2, name: "Bob", address_city: nil, address_zip: nil }  # No address
])

# Default: keeps the nil values
left_join_result.autowrap.to_a
=>
[{:id=>1, :name=>"Alice", :address=>{:city=>"London", :zip=>"SW1"}},
 {:id=>2, :name=>"Bob", :address=>{:city=>nil, :zip=>nil}}]

# With :nil postprocessor: replaces all-nil hashes with nil
left_join_result.autowrap(postprocessor: :nil).to_a
=>
[{:id=>1, :name=>"Alice", :address=>{:city=>"London", :zip=>"SW1"}},
 {:id=>2, :name=>"Bob", :address=>nil}]

# With :delete postprocessor: removes all-nil attributes entirely
left_join_result.autowrap(postprocessor: :delete).to_a
=>
[{:id=>1, :name=>"Alice", :address=>{:city=>"London", :zip=>"SW1"}},
 {:id=>2, :name=>"Bob"}]
```

#### Practical example: SQL join to JSON

```ruby
# Flat SQL join result
sql_result = Bmg::Relation.new([
  { order_id: 1, order_date: "2024-01-15",
    customer_id: 100, customer_name: "Alice",
    item_id: 1, item_product: "Widget", item_qty: 2 },
  { order_id: 1, order_date: "2024-01-15",
    customer_id: 100, customer_name: "Alice",
    item_id: 2, item_product: "Gadget", item_qty: 1 }
])

# Transform to nested structure
sql_result.autowrap.to_a

=>
[{:order=>{:id=>1, :date=>"2024-01-15"},
  :customer=>{:id=>100, :name=>"Alice"},
  :item=>{:id=>1, :product=>"Widget", :qty=>2}},
 {:order=>{:id=>1, :date=>"2024-01-15"},
  :customer=>{:id=>100, :name=>"Alice"},
  :item=>{:id=>2, :product=>"Gadget", :qty=>1}}]
```

### Comparison with unwrap

`autowrap` and `unwrap` are conceptual inverses:

- `autowrap` - Detects naming patterns and creates nested Hashes
- `unwrap` - Flattens nested Hashes back to top-level attributes

However, they're not perfect inverses because `autowrap` uses naming conventions while `unwrap` simply merges keys.
