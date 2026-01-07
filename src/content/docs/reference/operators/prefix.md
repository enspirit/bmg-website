---
title: prefix
---

```ruby
rel.prefix(:foo_, but: [:a, ...])
```

### Problem

Add a prefix to all (or most) attribute names.

Example: *I'm joining suppliers and parts, and both have a `name` attribute. I want to prefix all supplier attributes with `supplier_` to avoid conflicts.*

### Description

A shortcut for bulk renaming that adds a prefix to attribute names. The `but` option allows excluding specific attributes from being prefixed.

### Requirements

None specific. The `but` attributes, if specified, must exist in the input relation's heading.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in this example.*

```ruby
suppliers.prefix(:supplier_).to_a

=>
[{:supplier_sid=>"S1", :supplier_name=>"Smith", :supplier_status=>20, :supplier_city=>"London"},
 {:supplier_sid=>"S2", :supplier_name=>"Jones", :supplier_status=>10, :supplier_city=>"Paris"},
 {:supplier_sid=>"S3", :supplier_name=>"Blake", :supplier_status=>30, :supplier_city=>"Paris"},
 {:supplier_sid=>"S4", :supplier_name=>"Clark", :supplier_status=>20, :supplier_city=>"London"},
 {:supplier_sid=>"S5", :supplier_name=>"Adams", :supplier_status=>30, :supplier_city=>"Athens"}]
```

With the `but` option to exclude certain attributes:

```ruby
suppliers.prefix(:supplier_, but: [:sid]).to_a

=>
[{:sid=>"S1", :supplier_name=>"Smith", :supplier_status=>20, :supplier_city=>"London"},
 {:sid=>"S2", :supplier_name=>"Jones", :supplier_status=>10, :supplier_city=>"Paris"},
 {:sid=>"S3", :supplier_name=>"Blake", :supplier_status=>30, :supplier_city=>"Paris"},
 {:sid=>"S4", :supplier_name=>"Clark", :supplier_status=>20, :supplier_city=>"London"},
 {:sid=>"S5", :supplier_name=>"Adams", :supplier_status=>30, :supplier_city=>"Athens"}]
```
