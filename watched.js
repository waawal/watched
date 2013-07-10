// Generated by CoffeeScript 1.4.0
(function() {
  var get_repos, get_user, render_table;

  $.fn.spin = function(opts) {};

  (function($) {
    return $.fn.spin = function(opts, color) {
      var presets;
      presets = {
        tiny: {
          lines: 8,
          length: 2,
          width: 2,
          radius: 3
        },
        small: {
          lines: 8,
          length: 4,
          width: 3,
          radius: 5
        },
        large: {
          lines: 10,
          length: 8,
          width: 4,
          radius: 8
        }
      };
      if (Spinner) {
        return this.each(function() {
          var $this, data;
          $this = $(this);
          data = $this.data();
          if (data.spinner) {
            data.spinner.stop();
            delete data.spinner;
          }
          if (opts !== false) {
            if (typeof opts === "string") {
              if (opts in presets) {
                opts = presets[opts];
              } else {
                opts = {};
              }
              if (color) {
                opts.color = color;
              }
            }
            return data.spinner = new Spinner($.extend({
              color: $this.css("color")
            }, opts)).spin(this);
          }
        });
      } else {
        throw "Spinner class not available.";
      }
    };
  })(jQuery);

  get_user = function($formfield) {
    var uri;
    uri = "users/" + ($formfield.val());
    $formfield.blur();
    return routie(uri);
  };

  render_table = function(repos, name, table) {
    var $table, $tbody, amount, html, template;
    if (table == null) {
      table = "table";
    }
    $table = $(table);
    $tbody = $table.children("tbody:first");
    template = "{{#array}}\n    <tr>\n          <td><a href=\"{{html_url}}\" title=\"{{full_name}}\">{{name}}</a></td>\n          <td>{{description}}</td>\n          <td><img src=\"{{owner.avatar_url}}\"> <a href=\"#users/{{owner.login}}\">{{owner.login}}</a></td>\n          <td>{{watchers}}</td>\n          <td>{{language}}</td>\n      </tr>\n{{/array}}";
    html = Mustache.to_html(template, {
      array: repos
    });
    if (repos) {
      amount = repos.length;
    } else {
      amount = 0;
    }
    $("header p").html(Mustache.to_html('<a href="https://github.com/{{name}}">{{name}}</a> ({{amount}})', {
      name: name,
      amount: amount
    }));
    $tbody.hide();
    $tbody.html(html);
    $tbody.fadeIn(1200);
    $table.stupidtable();
    return $("#spinner").spin(false);
  };

  get_repos = function(user) {
    var allRepos, firstUrl, get_repo;
    $("#spinner").spin("large");
    firstUrl = "https://api.github.com/users/" + user + "/starred?page=1&per_page=100&callback=?";
    allRepos = [];
    get_repo = function(page) {
      return $.ajax(page, {
        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        cache: true,
        success: function(data, status, xhr) {
          var entry, next, _i, _len, _ref;
          if (data.meta.status !== 200) {
            $("#spinner").spin(false);
            $("tbody:first").fadeOut('slow');
            $("tbody:first").empty();
            $("header p").html("User not found.");
            return;
          }
          allRepos = allRepos.concat(data.data);
          if (data.meta['Link']) {
            _ref = data.meta['Link'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              entry = _ref[_i];
              if (entry[1]['rel'] === 'next') {
                next = entry[0];
              }
            }
          }
          if (next) {
            return get_repo(next);
          } else {
            return render_table(allRepos, user);
          }
        }
      });
    };
    return get_repo(firstUrl);
  };

  $(document).ready(function() {
    routie('users/:name', function(name) {
      get_repos(name);
      return document.title = name + " (Watched Repositories)";
    });
    return $("form:first").submit(function() {
      return get_user($("input:first"));
    });
  });

}).call(this);
