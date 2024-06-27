require 'json'
require 'bmg/sequel'

db = Bmg::Database.sequel("sqlite://./suppliers-and-parts.db")

parts_in_paris = db.suppliers
  .restrict(Predicate.eq(:city, "Paris"))
  .project([:sid])
  .join(db.supplies, [:sid])
  .join(db.parts, [:pid])
  .project([:name, :weight, :qty])

puts "SQL:"
puts parts_in_paris.to_sql
puts "\nParts in Paris:"
puts JSON.pretty_generate(parts_in_paris)

total_weights_in_paris = parts_in_paris
  .extend(total_weight: -> (t) { t[:qty] * t[:weight] } )
  .summarize([:name], total_weight: :sum)

puts "\nTotal weights in Paris:"
puts JSON.pretty_generate(total_weights_in_paris)
total_weights_in_paris
.debug

puts "\nRestricting further is compiled to SQL:"
total_weights_in_paris
  .restrict(name: 'Smith')
  .debug
