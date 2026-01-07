---
title: generator
---

```ruby
Bmg.generate(1, 10)
Bmg.generate(1, 100, step: 10)
Bmg.generate(from, to, as: :n, step: 2)
```

### Problem

Generate a sequence of values as a relation.

Example: *I need a relation of consecutive integers to join with other data or generate test data.*

### Description

The `generator` creates a relation from a sequence of values, similar to PostgreSQL's `generate_series`. It produces tuples with a single attribute containing values from a starting point to an ending point.

This is a factory method called on `Bmg` directly, not an operator called on an existing relation.

Parameters:
- `from` - Starting value (required)
- `to` - Ending value (required)
- `options`:
  - `as` - Attribute name for the generated value (default: `:i`)
  - `step` - Increment between values (default: `1`), can be:
    - A number (positive or negative)
    - A lambda for custom stepping

### Requirements

- `from` and `to` must be provided
- Values must support comparison (`>`, `<`) and addition (`+`) operations

### Examples

#### Basic sequence

```ruby
Bmg.generate(1, 5).to_a

=>
[{:i=>1}, {:i=>2}, {:i=>3}, {:i=>4}, {:i=>5}]
```

#### Custom attribute name

```ruby
Bmg.generate(1, 3, as: :number).to_a

=>
[{:number=>1}, {:number=>2}, {:number=>3}]
```

#### With step

```ruby
Bmg.generate(0, 10, step: 2).to_a

=>
[{:i=>0}, {:i=>2}, {:i=>4}, {:i=>6}, {:i=>8}, {:i=>10}]
```

#### Descending sequence

Use a negative step to count down:

```ruby
Bmg.generate(5, 1, step: -1).to_a

=>
[{:i=>5}, {:i=>4}, {:i=>3}, {:i=>2}, {:i=>1}]
```

#### Float sequences

```ruby
Bmg.generate(0.0, 1.0, step: 0.25).to_a

=>
[{:i=>0.0}, {:i=>0.25}, {:i=>0.5}, {:i=>0.75}, {:i=>1.0}]
```

#### Date sequences

Generate consecutive dates:

```ruby
require 'date'

Bmg.generate(Date.new(2024, 1, 1), Date.new(2024, 1, 5)).to_a

=>
[{:i=>Date.new(2024, 1, 1)},
 {:i=>Date.new(2024, 1, 2)},
 {:i=>Date.new(2024, 1, 3)},
 {:i=>Date.new(2024, 1, 4)},
 {:i=>Date.new(2024, 1, 5)}]
```

#### Custom step function

Use a lambda for non-linear sequences:

```ruby
# Exponential: 1, 2, 4, 8
Bmg.generate(1, 10, step: ->(i) { i * 2 }).to_a

=>
[{:i=>1}, {:i=>2}, {:i=>4}, {:i=>8}]
```

#### Join with other data

Generate sequences to join with existing relations:

```ruby
# Create a calendar of dates
dates = Bmg.generate(Date.new(2024, 1, 1), Date.new(2024, 1, 31), as: :date)

# Left join with events to see all dates (including those without events)
dates.left_join(events, [:date], { title: nil, location: nil })
```

#### Generate test data

```ruby
# Generate IDs and extend with computed values
Bmg.generate(1, 100, as: :id)
   .extend(
     name: ->(t) { "User #{t[:id]}" },
     email: ->(t) { "user#{t[:id]}@example.com" }
   )
   .to_a

=>
[{:id=>1, :name=>"User 1", :email=>"user1@example.com"},
 {:id=>2, :name=>"User 2", :email=>"user2@example.com"},
 ...]
```

#### Empty result

If `from > to` with a positive step, the result is empty:

```ruby
Bmg.generate(10, 1).to_a
=> []
```

### Note

Unlike most Bmg operations which are lazy, `generator` creates tuples on-demand during iteration. Be cautious with very large ranges as they will be fully materialized when converted to an array or iterated.
