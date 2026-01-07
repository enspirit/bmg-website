---
title: ungroup
---

```ruby
rel.ungroup([:attr])
rel.ungroup([:attr1, :attr2])
```

### Problem

Flatten a relation-valued attribute back into regular tuples.

Example: *I have suppliers with nested supplies, and I want to flatten them back into individual rows.*

### Description

The `ungroup` operator is the inverse of `group`. It takes a relation that has a relation-valued attribute (RVA) and expands it, creating one tuple for each combination of the outer tuple and the tuples in the nested relation.

If the nested relation is empty, the outer tuple is removed from the result (similar to an inner join).

Multiple attributes can be ungrouped in a single operation by passing an array of attribute names.

### Requirements

The specified attributes must be relation-valued attributes in the input relation.

### Examples

#### Basic ungroup

Starting with a grouped relation:

```ruby
# First, create a grouped relation
grouped = supplies.group([:pid, :qty], :supplied_parts)
grouped.to_a

=>
[{:sid=>"S1", :supplied_parts=>#<Bmg::Relation [{:pid=>"P1", :qty=>300}, {:pid=>"P2", :qty=>200}, ...]>},
 {:sid=>"S2", :supplied_parts=>#<Bmg::Relation [{:pid=>"P1", :qty=>300}, {:pid=>"P2", :qty=>400}]>},
 {:sid=>"S3", :supplied_parts=>#<Bmg::Relation [{:pid=>"P2", :qty=>200}]>},
 {:sid=>"S4", :supplied_parts=>#<Bmg::Relation [{:pid=>"P2", :qty=>200}, ...]>}]

# Now ungroup to flatten back
grouped.ungroup([:supplied_parts]).to_a

=>
[{:sid=>"S1", :pid=>"P1", :qty=>300},
 {:sid=>"S1", :pid=>"P2", :qty=>200},
 {:sid=>"S1", :pid=>"P3", :qty=>400},
 {:sid=>"S1", :pid=>"P4", :qty=>200},
 {:sid=>"S1", :pid=>"P5", :qty=>100},
 {:sid=>"S1", :pid=>"P6", :qty=>100},
 {:sid=>"S2", :pid=>"P1", :qty=>300},
 {:sid=>"S2", :pid=>"P2", :qty=>400},
 {:sid=>"S3", :pid=>"P2", :qty=>200},
 {:sid=>"S4", :pid=>"P2", :qty=>200},
 {:sid=>"S4", :pid=>"P4", :qty=>300},
 {:sid=>"S4", :pid=>"P5", :qty=>400}]
```

#### Ungrouping image results

Ungroup can be used to flatten the results of an `image` operation:

```ruby
# Create nested structure
nested = suppliers.image(supplies, :supplies, [:sid])

# Flatten back to individual rows
nested.ungroup([:supplies]).to_a

=>
[{:sid=>"S1", :name=>"Smith", :status=>20, :city=>"London", :pid=>"P1", :qty=>300},
 {:sid=>"S1", :name=>"Smith", :status=>20, :city=>"London", :pid=>"P2", :qty=>200},
 ...
 {:sid=>"S4", :name=>"Clark", :status=>20, :city=>"London", :pid=>"P5", :qty=>400}]
```

Note: S5 (Adams) is not in the result because their supplies relation was empty.

#### Multiple ungroup

When you have multiple nested attributes, you can ungroup them all at once:

```ruby
doubly_grouped.ungroup([:attr1, :attr2])
```

This is equivalent to chaining ungroup operations but may be more efficient.

### Relationship with group

`ungroup` and `group` are inverse operations:

```ruby
# Starting with supplies
supplies.to_a
=> [{:sid=>"S1", :pid=>"P1", :qty=>300}, ...]

# Group by sid
grouped = supplies.group([:pid, :qty], :items)

# Ungroup back - returns to original
grouped.ungroup([:items]).to_a
=> [{:sid=>"S1", :pid=>"P1", :qty=>300}, ...]  # Same as original
```

### Empty nested relations

When a nested relation is empty, the outer tuple is excluded from the result:

```ruby
# S5 has no supplies, so after image they have an empty relation
with_image = suppliers.image(supplies, :supplies, [:sid])

# After ungroup, S5 disappears entirely
with_image.ungroup([:supplies]).restrict(sid: "S5").to_a
=> []  # S5 is not in the result
```
