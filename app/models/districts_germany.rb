class DistrictsGermany
  def self.list
    features.map do |d|
      p = d.fetch('properties')
      [
        p.fetch('name'),
        p.fetch('id')
      ]
    end.sort
  end

  def self.all
    JSON.parse(File.read(Rails.root.join('app/assets/geo/districts_germany.geojson')))
  end

  def self.geometry(id)
    feature(id).fetch('geometry')
  end

  def self.name(id)
    feature(id).fetch('properties').fetch('name')
  end

  def self.feature(id)
    features.find do |d|
      d.fetch('properties').fetch('id') == id
    end
  end

  def self.features
    all.fetch('features')
  end
end
