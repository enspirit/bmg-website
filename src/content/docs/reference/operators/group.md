---
title: group
---

```ruby
rel.group([:a, :b, ...])
rel.group([:a, :b, ...], :my_group)
rel.group([:a, :b, ...], :my_group, array: true)
```

### Problem

Place tuples in groups based on common values for some attributes.

Example: *Which are all our stores listed by city, with full details on each store?*

### Description

`group` splits the attributes of the input relation into two sets: the attributes given in the first argument, and all the remaining ones, called the *grouping* attributes. Below, we refer to these disjoint sets as `grouped-attrs` and `grouping-attrs` respectively.

`group` creates groups of `grouped-attrs`-tuples from the input, and pairs those groups with the corresponding `grouping-attrs`. We say that we *group by* the `grouping-attrs`, or, equivalently, that we *group over* the `grouped-attrs`.

To be more specific: the output consists of the unique tuples obtained by [projecting](reference/operations/project) the `grouping-attrs` from the input, and extending each such tuple with a [nested relation](/ra-primer/relations-as-attributes) with the `grouped-attrs`, such that for each combination of values in the input, a corresponding tuple is found in each nested relation.

If this sounds complicated, is will be quite intuitive when you see it in action! See the example below.

A simple implementation might look like this:

```ruby
def group(rel, grouped_attrs)
  grouping_attrs = rel.type.attrlist - grouped_attrs
  rel.allbut(grouped_attrs)
     .extend(
       group: -> (tuple) {
         rel.matching(tuple.to_relation, [:city])
            .project(grouped_attrs)
       }
     )
end
```

Optionally, `as`, the name of the attribute containing the nested relations, can be given. The default is `:group`.

If the option `array: true` is passed, the nested relations will be turned into arrays. TODO: WHY IS THIS USEFUL? There isn't much (anything?) you can do with arrays that you can't do with relations.

### Requirements

The specified attributes must be part of the input relation's heading.

If `array: true` is given, then the `as` argument **must** also be given.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in these examples.*

```ruby
suppliers.group([:sid, :name, :status], :my_group).to_a

=>
[{:city=>"London",
  :my_group=>
   (in_memory #<Set: {{:sid=>"S1", :name=>"Smith", :status=>20}, {:sid=>"S4", :name=>"Clark", :status=>20}}>)},
 {:city=>"Paris",
  :my_group=>
   (in_memory #<Set: {{:sid=>"S2", :name=>"Jones", :status=>10}, {:sid=>"S3", :name=>"Blake", :status=>30}}>)},
 {:city=>"Athens", :my_group=>(in_memory #<Set: {{:sid=>"S5", :name=>"Adams", :status=>30}}>)}]
```

Here is a formatted representation of the result:

```
+--------+----------------------------+
| :city  | :my_group                  |
+--------+----------------------------+
| London | +------+-------+---------+ |
|        | | :sid | :name | :status | |
|        | +------+-------+---------+ |
|        | | S1   | Smith |      20 | |
|        | | S4   | Clark |      20 | |
|        | +------+-------+---------+ |
|--------+----------------------------+
| Paris  | +------+-------+---------+ |
|        | | :sid | :name | :status | |
|        | +------+-------+---------+ |
|        | | S2   | Jones |      10 | |
|        | | S3   | Blake |      30 | |
|        | +------+-------+---------+ |
|--------+----------------------------+
| Athens | +------+-------+---------+ |
|        | | :sid | :name | :status | |
|        | +------+-------+---------+ |
|        | | S5   | Adams |      30 | |
|        | +------+-------+---------+ |
+--------+----------------------------+
```

##### Generated SQL

Bmg does not currently compile `group` operations into SQL. The `GROUP BY` clause in SQL behaves quite differently, since SQL doesn't support nested relations. A similar behavior can be produced by using support for array or JSON values, depending on the database system. (The SQL:2023 standard introduced a JSON data type, but it's not yet widely supported.)

An example for Postgres might look like this:

```sql
SELECT
    city,
    ARRAY_AGG(ROW(sid, name, status)) AS group
FROM
    suppliers
GROUP BY
    city;
```

(Note that in a `GROUP BY` clause you specify the `grouping-attrs`, whereas in Bmg you specify the `grouped-attrs`.)
