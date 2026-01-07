---
title: suffix
---

```ruby
rel.suffix(:_foo, but: [:a, ...])
```

### Problem

Add a suffix to all (or most) attribute names.

Example: *I'm joining suppliers and parts, and both have a `name` attribute. I want to suffix all supplier attributes with `_supplier` to avoid conflicts.*

### Description

A shortcut for bulk renaming that adds a suffix to attribute names. The `but` option allows excluding specific attributes from being suffixed.

### Requirements

None specific. The `but` attributes, if specified, must exist in the input relation's heading.

### Examples

*Consult the [Overview page](/reference/overview) for the data model used in this example.*

```ruby
suppliers.suffix(:_supplier).to_a

=>
[{:sid_supplier=>"S1", :name_supplier=>"Smith", :status_supplier=>20, :city_supplier=>"London"},
 {:sid_supplier=>"S2", :name_supplier=>"Jones", :status_supplier=>10, :city_supplier=>"Paris"},
 {:sid_supplier=>"S3", :name_supplier=>"Blake", :status_supplier=>30, :city_supplier=>"Paris"},
 {:sid_supplier=>"S4", :name_supplier=>"Clark", :status_supplier=>20, :city_supplier=>"London"},
 {:sid_supplier=>"S5", :name_supplier=>"Adams", :status_supplier=>30, :city_supplier=>"Athens"}]
```

With the `but` option to exclude certain attributes:

```ruby
suppliers.suffix(:_supplier, but: [:sid]).to_a

=>
[{:sid=>"S1", :name_supplier=>"Smith", :status_supplier=>20, :city_supplier=>"London"},
 {:sid=>"S2", :name_supplier=>"Jones", :status_supplier=>10, :city_supplier=>"Paris"},
 {:sid=>"S3", :name_supplier=>"Blake", :status_supplier=>30, :city_supplier=>"Paris"},
 {:sid=>"S4", :name_supplier=>"Clark", :status_supplier=>20, :city_supplier=>"London"},
 {:sid=>"S5", :name_supplier=>"Adams", :status_supplier=>30, :city_supplier=>"Athens"}]
```
