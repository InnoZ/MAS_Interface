# The dataset method of this class generates a grid with hexagonally
# shaped cells in it, with the given side length.
class GridFactory
  attr_reader :bounds, :side_length

  def initialize(bounds:, side_length:)
    @bounds = bounds
    @side_length = side_length
  end

  # rubocop:disable AbcSize
  def dataset
    xy.select_append do |o|
      o.ST_Translate(
        hexagon,
        # position hexagon horizontally
        o.x * side_length * 1.5 + box.centerx,
        # position hexagon vertically - every second one is raised
        # by half the height
        Sequel.lit('(y + (x % 2 / 2.0)) * ? * sqrt(3) + ?', side_length, box.centery)
      ).as(:cell)
    end
  end

  private

  # rubocop:disable MethodLength
  # Create a polygon with 7 points, counter clockwise starting from
  # bottom left
  def hexagon
    Sequel.virtual_row do |o|
      o.ST_MakePolygon(
        o.ST_MakeLine(
          Sequel.pg_array(
            [
              o.ST_MakePoint(-0.5 * side_length, -half_height),
              o.ST_MakePoint(0.5 * side_length, -half_height),
              o.ST_MakePoint(1.0 * side_length, 0),
              o.ST_MakePoint(0.5 * side_length, half_height),
              o.ST_MakePoint(-0.5 * side_length, half_height),
              o.ST_MakePoint(-1.0 * side_length, 0),
              o.ST_MakePoint(-0.5 * side_length, -half_height),
            ]
          )
        )
      )
    end
  end

  def height
    side_length * Math.sqrt(3)
  end

  def half_height
    height / 2
  end

  # How much horizontal space one cell fills up when they are stacked
  # on top of each other
  def net_cell_width
    side_length * 1.5
  end

  def xy
    DB[
      Sequel.virtual_row { |o| o.generate_series(xmin, xmax) }.as(:x)
    ].cross_join(
      Sequel.virtual_row { |o| o.generate_series(ymin, ymax) }.as(:y)
    ).order(:x, :y)
  end

  def box
    @box ||= Box.new(self)
  end

  def xmin
    -(box.width / 2 / net_cell_width).floor
  end

  def xmax
    (box.width / 2 / net_cell_width).floor
  end

  def ymin
    -(box.height / 2 / height).ceil
  end

  def ymax
    (box.height / 2 / height).ceil
  end

  class Box
    attr_reader :centerx, :centery, :width, :height

    def initialize(grid)
      @centerx, @centery, @width, @height = DB[grid.bounds.as(:box)]
                                            .select        { ST_X(ST_Centroid(box)) }
                                            .select_append { ST_Y(ST_Centroid(box)) }
                                            .select_append { (ST_XMax(box) - ST_XMin(box)).as(:width) }
                                            .select_append { (ST_YMax(box) - ST_YMin(box)).as(:height) }
                                            .first.values
    end
  end
end
