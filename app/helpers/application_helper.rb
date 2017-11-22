module ApplicationHelper
  def pages
    %w[
      about
      contact
    ]
  end

  def translations_for_js
    I18n.backend.send(:init_translations) unless I18n.backend.initialized?
    @translations ||= I18n.backend.send(:translations)
    @translations[I18n.locale].with_indifferent_access # allow keys :foo and 'foo'
  end
end
