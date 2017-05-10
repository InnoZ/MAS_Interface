class DistrictsGermany
  def self.list
    JSON.parse(file).fetch('features').map do |d|
      p = d.fetch('properties')
      [
        p.fetch('name'),
        p.fetch('id')
      ]
    end.sort
  end

  def self.file
    File.read(Rails.root.join('app/assets/geo/districts_germany.geojson'))
  end
end
