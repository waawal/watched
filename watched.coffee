
# https://gist.github.com/1290439
$.fn.spin = (opts) ->
(($) ->
  $.fn.spin = (opts, color) ->
    presets =
      tiny:
        lines: 8
        length: 2
        width: 2
        radius: 3

      small:
        lines: 8
        length: 4
        width: 3
        radius: 5

      large:
        lines: 10
        length: 8
        width: 4
        radius: 8

    if Spinner
      @each ->
        $this = $(this)
        data = $this.data()
        if data.spinner
          data.spinner.stop()
          delete data.spinner
        if opts isnt false
          if typeof opts is "string"
            if opts of presets
              opts = presets[opts]
            else
              opts = {}
            opts.color = color  if color
          data.spinner = new Spinner($.extend(
            color: $this.css("color")
          , opts)).spin(this)
    else
      throw "Spinner class not available."
) jQuery

get_user = ($formfield) ->
  uri = "users/#{ $formfield.val() }"
  $formfield.val ""
  $formfield.blur()
  routie uri
  

render_table = (repos, name, table="table") ->
  $table = $(table)
  $tbody = $table.children "tbody:first"
  template = """
  {{#array}}
      <tr>
            <td><a href="{{html_url}}" title="{{full_name}}">{{name}}</a></td>
            <td>{{description}}</td>
            <td><img src="{{owner.avatar_url}}"> <a href="#users/{{owner.login}}">{{owner.login}}</a></td>
            <td>{{watchers}}</td>
            <td>{{language}}</td>
        </tr>
  {{/array}}
  """
  html = Mustache.to_html template, { array: repos }
  $("header p").html Mustache.to_html '@<a href="https://github.com/{{name}}">{{name}}</a>', { name: name }
  $tbody.html html
  $table.stupidtable()
  $tbody.css("width","100%")
  $("#spinner").spin false

get_repos = (user) ->
  $("tbody:first").empty()
  $("#spinner").spin "large"
  firstUrl = "https://api.github.com/users/#{ user }/watched?page=1&per_page=100&callback=?"
  allRepos = []
  
  get_repo = (page) ->
    $.ajax page,
      jsonpCallback: 'jsonCallback',
      contentType: "application/json",
      dataType: 'jsonp',
      success : (data, status, xhr) ->
        allRepos = allRepos.concat data.data
        next = next[0] for next in data.meta when next[1]['rel'] == 'next'
        if next
          get_repo next[0]
        else
          render_table allRepos, user

  get_repo firstUrl
  

$(document).ready ->
  
  routie('users/:name',
  (name) -> get_repos(name)
  )
  
  $("form:first").submit ->
    get_user $("input:first")
    
