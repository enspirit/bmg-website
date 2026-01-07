---
title: page
---

```ruby
rel.page([[:name, :asc]], 1, page_size: 10)
rel.page([[:created_at, :desc]], 2, page_size: 25)
```

### Problem

Retrieve a specific page of results with ordering for pagination.

Example: *I want to display search results 10 at a time, showing page 3 sorted by date.*

### Description

The `page` operator implements pagination by returning a subset of tuples based on:
- An ordering specification (required for consistent pagination)
- A page index (1-based)
- A page size (default: 100)

The ordering is specified as an array of `[attribute, direction]` pairs, where direction is `:asc` or `:desc`.

Parameters:
- `ordering` - Array of `[attribute, direction]` pairs
- `page_index` - Which page to return (must be > 0)
- `options`:
  - `page_size` - Number of tuples per page (default: 100)

### Requirements

- Page index must be greater than 0
- Ordering attributes must exist in the relation

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in these examples.*

#### Basic pagination

```ruby
# Get first page of suppliers, 2 per page, ordered by name
suppliers.page([[:name, :asc]], 1, page_size: 2).to_a

=>
[{:sid=>"S5", :name=>"Adams", :status=>30, :city=>"Athens"},
 {:sid=>"S3", :name=>"Blake", :status=>30, :city=>"Paris"}]

# Get second page
suppliers.page([[:name, :asc]], 2, page_size: 2).to_a

=>
[{:sid=>"S4", :name=>"Clark", :status=>20, :city=>"London"},
 {:sid=>"S2", :name=>"Jones", :status=>10, :city=>"Paris"}]
```

#### Descending order

```ruby
# Get highest quantities first
supplies.page([[:qty, :desc]], 1, page_size: 3).to_a

=>
[{:sid=>"S1", :pid=>"P3", :qty=>400},
 {:sid=>"S2", :pid=>"P2", :qty=>400},
 {:sid=>"S4", :pid=>"P5", :qty=>400}]
```

#### Multi-column ordering

```ruby
# Order by city, then by name within each city
suppliers.page([[:city, :asc], [:name, :asc]], 1, page_size: 3).to_a

=>
[{:sid=>"S5", :name=>"Adams", :status=>30, :city=>"Athens"},
 {:sid=>"S4", :name=>"Clark", :status=>20, :city=>"London"},
 {:sid=>"S1", :name=>"Smith", :status=>20, :city=>"London"}]
```

#### Pagination with filtering

```ruby
# Filter first, then paginate
parts
  .restrict(Predicate.gt(:weight, 14))
  .page([[:weight, :asc]], 1, page_size: 2)
  .to_a

=>
[{:pid=>"P2", :name=>"Bolt", :color=>"Green", :weight=>17.0, :city=>"Paris"},
 {:pid=>"P3", :name=>"Screw", :color=>"Blue", :weight=>17.0, :city=>"Oslo"}]
```

#### Building a paginated API

```ruby
def get_suppliers(page: 1, per_page: 10, sort_by: :name, sort_dir: :asc)
  suppliers
    .page([[sort_by, sort_dir]], page, page_size: per_page)
    .to_a
end

# Usage
get_suppliers(page: 1, per_page: 5, sort_by: :status, sort_dir: :desc)
```

### Empty pages

Requesting a page beyond the available data returns an empty result:

```ruby
suppliers.page([[:name, :asc]], 100, page_size: 10).to_a
=> []
```

### Note on ordering

The ordering parameter is required because pagination without ordering produces unpredictable results. Each page request needs consistent ordering to ensure tuples don't appear on multiple pages or get skipped.

```ruby
# Always specify ordering for predictable pagination
rel.page([[:id, :asc]], 1, page_size: 10)
```
