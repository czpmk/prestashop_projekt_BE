

window = ( typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {} );
document = window.document || {};

; ( function ( factory, global ) {
  if ( typeof require === "function" && typeof exports === "object" && typeof module === "object" ) {

    // CommonJS
    factory( require( "jquery" ) );
  } else if ( typeof define === "function" && define.amd ) {

    // AMD
    define( [ "jquery" ], factory );
  } else {

    // Normal script tag
    factory( global.jQuery );
  }
}( function ( $ ) {
  "use strict";

  var unique = 0;
  var eventStorage = {};
  var possibleEvents = {};
  var emojione = window.emojione;
  var readyCallbacks = [];
  function emojioneReady (fn) {
    if (emojione) {
      fn();
    } else {
      readyCallbacks.push(fn);
    }
  };

  var blankImg = 'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw==';
  var slice = [].slice;
  var css_class = "emojionearea";
  var emojioneSupportMode = 0;
  var invisibleChar = '&#8203;';
  function trigger(self, event, args) {
    var result = true, j = 1;
    if (event) {
      event = event.toLowerCase();
      do {
        var _event = j==1 ? '@' + event : event;
        if (eventStorage[self.id][_event] && eventStorage[self.id][_event].length) {
          $.each(eventStorage[self.id][_event], function (i, fn) {
            return result = fn.apply(self, args|| []) !== false;
          });
        }
      } while (result && !!j--);
    }
    return result;
  }
  function attach(self, element, events, target) {
    target = target || function (event, callerEvent) { return $(callerEvent.currentTarget) };
    $.each(events, function(event, link) {
      event = $.isArray(events) ? link : event;
      (possibleEvents[self.id][link] || (possibleEvents[self.id][link] = []))
          .push([element, event, target]);
    });
  }
  function getTemplate(template, unicode, shortname) {
    var imageType = emojione.imageType, imagePath;
    if (imageType=='svg'){
      imagePath = emojione.imagePathSVG;
    } else {
      imagePath = emojione.imagePathPNG;
    }
    var friendlyName = '';
    if (shortname) {
      friendlyName = shortname.substr(1, shortname.length - 2).replace(/_/g, ' ').replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
    return template
        .replace('{name}', shortname || '')
        .replace('{friendlyName}', friendlyName)
        .replace('{img}', imagePath + (emojioneSupportMode < 2 ? unicode.toUpperCase() : unicode) + '.' + imageType)
        .replace('{uni}', unicode)
        .replace('{alt}', emojione.convert(unicode));
  };
  function shortnameTo(str, template, clear) {
    return str.replace(/:?\+?[\w_\-]+:?/g, function(shortname) {
      shortname = ":" + shortname.replace(/:$/,'').replace(/^:/,'') + ":";
      var unicode = emojione.emojioneList[shortname];
      if (unicode) {
        if (emojioneSupportMode > 3) unicode = unicode.unicode;
        return getTemplate(template, unicode[unicode.length-1], shortname);
      }
      return clear ? '' : shortname;
    });
  };
  function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        var el = document.createElement("div");
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node, lastNode;
        while ( (node = el.firstChild) ) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } else if (document.selection && document.selection.type != "Control") {
      document.selection.createRange().pasteHTML(html);
    }
  }
  var getDefaultOptions = function () {
    return $.fn.emojioneArea && $.fn.emojioneArea.defaults ? $.fn.emojioneArea.defaults : {
      attributes: {
        dir               : "ltr",
        spellcheck        : false,
        autocomplete      : "off",
        autocorrect       : "off",
        autocapitalize    : "off",
      },
      placeholder       : null,
      emojiPlaceholder  : ":smiley:",
      container         : null,
      hideSource        : true,
      shortnames        : true,
      sprite            : true,
      pickerPosition    : "top", // top | bottom | right
      filtersPosition   : "top", // top | bottom
      hidePickerOnBlur  : true,
      buttonTitle       : "Use the TAB key to insert emoji faster",
      tones             : true,
      tonesStyle        : "bullet", // bullet | radio | square | checkbox
      inline            : null, // null - auto
      saveEmojisAs      : "shortname", // unicode | shortname | image
      shortcuts         : true,
      autocomplete      : true,
      autocompleteTones : false,
      standalone        : false,
      useInternalCDN    : true, // Use the self loading mechanism
      imageType         : "svg", // Default image type used by internal CDN
      recentEmojis      : true,
      textcomplete: {
        maxCount      : 15,
        placement     : null // null - default | top | absleft | absright
      },

      filters: {
        tones: {
          title: "Diversity",
          emoji: "santa runner surfer swimmer lifter ear nose point_up_2 point_down point_left point_right punch " +
          "wave ok_hand thumbsup thumbsdown clap open_hands boy girl man woman cop bride_with_veil person_with_blond_hair " +
          "man_with_gua_pi_mao man_with_turban older_man grandma baby construction_worker princess angel " +
          "information_desk_person guardsman dancer nail_care massage haircut muscle spy hand_splayed middle_finger " +
          "vulcan no_good ok_woman bow raising_hand raised_hands person_frowning person_with_pouting_face pray rowboat " +
          "bicyclist mountain_bicyclist walking bath metal point_up basketball_player fist raised_hand v writing_hand"
        },

        recent: {
          icon: "clock3",
          title: "Recent",
          emoji: ""
        },

        smileys_people: {
          icon: "yum",
          title: "Smileys & People",
          emoji: "grinning grimacing grin joy smiley smile sweat_smile laughing innocent wink blush slight_smile " +
          "upside_down relaxed yum relieved heart_eyes kissing_heart kissing kissing_smiling_eyes " +
          "kissing_closed_eyes stuck_out_tongue_winking_eye stuck_out_tongue_closed_eyes stuck_out_tongue " +
          "money_mouth nerd sunglasses hugging smirk no_mouth neutral_face expressionless unamused rolling_eyes " +
          "thinking flushed disappointed worried angry rage pensive confused slight_frown frowning2 persevere " +
          "confounded tired_face weary triumph open_mouth scream fearful cold_sweat hushed frowning anguished " +
          "cry disappointed_relieved sleepy sweat sob dizzy_face astonished zipper_mouth mask thermometer_face " +
          "head_bandage sleeping zzz poop smiling_imp imp japanese_ogre japanese_goblin skull ghost alien robot " +
          "smiley_cat smile_cat joy_cat heart_eyes_cat smirk_cat kissing_cat scream_cat crying_cat_face " +
          "pouting_cat raised_hands clap wave thumbsup thumbsdown punch fist v ok_hand raised_hand open_hands " +
          "muscle pray point_up point_up_2 point_down point_left point_right middle_finger hand_splayed metal " +
          "vulcan writing_hand nail_care lips tongue ear nose eye eyes bust_in_silhouette busts_in_silhouette " +
          "speaking_head baby boy girl man woman person_with_blond_hair older_man older_woman man_with_gua_pi_mao " +
          "man_with_turban cop construction_worker guardsman spy santa angel princess bride_with_veil walking " +
          "runner dancer dancers couple two_men_holding_hands two_women_holding_hands bow information_desk_person " +
          "no_good ok_woman raising_hand person_with_pouting_face person_frowning haircut massage couple_with_heart " +
          "couple_ww couple_mm couplekiss kiss_ww kiss_mm family family_mwg family_mwgb family_mwbb family_mwgg " +
          "family_wwb family_wwg family_wwgb family_wwbb family_wwgg family_mmb family_mmg family_mmgb family_mmbb " +
          "family_mmgg womans_clothes shirt jeans necktie dress bikini kimono lipstick kiss footprints high_heel " +
          "sandal boot mans_shoe athletic_shoe womans_hat tophat helmet_with_cross mortar_board crown school_satchel " +
          "pouch purse handbag briefcase eyeglasses dark_sunglasses ring closed_umbrella"
        },

        animals_nature: {
          icon: "hamster",
          title: "Animals & Nature",
          emoji: "dog cat mouse hamster rabbit bear panda_face koala tiger lion_face cow pig pig_nose frog " +
          "octopus monkey_face see_no_evil hear_no_evil speak_no_evil monkey chicken penguin bird baby_chick " +
          "hatching_chick hatched_chick wolf boar horse unicorn bee bug snail beetle ant spider scorpion crab " +
          "snake turtle tropical_fish fish blowfish dolphin whale whale2 crocodile leopard tiger2 water_buffalo " +
          "ox cow2 dromedary_camel camel elephant goat ram sheep racehorse pig2 rat mouse2 rooster turkey dove " +
          "dog2 poodle cat2 rabbit2 chipmunk feet dragon dragon_face cactus christmas_tree evergreen_tree " +
          "deciduous_tree palm_tree seedling herb shamrock four_leaf_clover bamboo tanabata_tree leaves " +
          "fallen_leaf maple_leaf ear_of_rice hibiscus sunflower rose tulip blossom cherry_blossom bouquet " +
          "mushroom chestnut jack_o_lantern shell spider_web earth_americas earth_africa earth_asia full_moon " +
          "waning_gibbous_moon last_quarter_moon waning_crescent_moon new_moon waxing_crescent_moon " +
          "first_quarter_moon waxing_gibbous_moon new_moon_with_face full_moon_with_face first_quarter_moon_with_face " +
          "last_quarter_moon_with_face sun_with_face crescent_moon star star2 dizzy sparkles comet sunny " +
          "white_sun_small_cloud partly_sunny white_sun_cloud white_sun_rain_cloud cloud cloud_rain " +
          "thunder_cloud_rain cloud_lightning zap fire boom snowflake cloud_snow snowman2 snowman wind_blowing_face " +
          "dash cloud_tornado fog umbrella2 umbrella droplet sweat_drops ocean"
        },

        food_drink: {
          icon: "pizza",
          title: "Food & Drink",
          emoji: "green_apple apple pear tangerine lemon banana watermelon grapes strawberry melon cherries peach " +
          "pineapple tomato eggplant hot_pepper corn sweet_potato honey_pot bread cheese poultry_leg meat_on_bone " +
          "fried_shrimp egg hamburger fries hotdog pizza spaghetti taco burrito ramen stew fish_cake sushi bento " +
          "curry rice_ball rice rice_cracker oden dango shaved_ice ice_cream icecream cake birthday custard candy " +
          "lollipop chocolate_bar popcorn doughnut cookie beer beers wine_glass cocktail tropical_drink champagne " +
          "sake tea coffee baby_bottle fork_and_knife fork_knife_plate"
        },

        activity: {
          icon: "basketball",
          title: "Activity",
          emoji: "soccer basketball football baseball tennis volleyball rugby_football 8ball golf golfer ping_pong " +
          "badminton hockey field_hockey cricket ski skier snowboarder ice_skate bow_and_arrow fishing_pole_and_fish " +
          "rowboat swimmer surfer bath basketball_player lifter bicyclist mountain_bicyclist horse_racing levitate " +
          "trophy running_shirt_with_sash medal military_medal reminder_ribbon rosette ticket tickets performing_arts " +
          "art circus_tent microphone headphones musical_score musical_keyboard saxophone trumpet guitar violin " +
          "clapper video_game space_invader dart game_die slot_machine bowling"
        },

        travel_places: {
          icon: "rocket",
          title: "Travel & Places",
          emoji: "red_car taxi blue_car bus trolleybus race_car police_car ambulance fire_engine minibus truck " +
          "articulated_lorry tractor motorcycle bike rotating_light oncoming_police_car oncoming_bus " +
          "oncoming_automobile oncoming_taxi aerial_tramway mountain_cableway suspension_railway railway_car " +
          "train monorail bullettrain_side bullettrain_front light_rail mountain_railway steam_locomotive train2 " +
          "metro tram station helicopter airplane_small airplane airplane_departure airplane_arriving sailboat " +
          "motorboat speedboat ferry cruise_ship rocket satellite_orbital seat anchor construction fuelpump busstop " +
          "vertical_traffic_light traffic_light checkered_flag ship ferris_wheel roller_coaster carousel_horse " +
          "construction_site foggy tokyo_tower factory fountain rice_scene mountain mountain_snow mount_fuji volcano " +
          "japan camping tent park motorway railway_track sunrise sunrise_over_mountains desert beach island " +
          "city_sunset city_dusk cityscape night_with_stars bridge_at_night milky_way stars sparkler fireworks " +
          "rainbow homes european_castle japanese_castle stadium statue_of_liberty house house_with_garden " +
          "house_abandoned office department_store post_office european_post_office hospital bank hotel " +
          "convenience_store school love_hotel wedding classical_building church mosque synagogue kaaba shinto_shrine"
        },

        objects: {
          icon: "bulb",
          title: "Objects",
          emoji: "watch iphone calling computer keyboard desktop printer mouse_three_button trackball joystick " +
          "compression minidisc floppy_disk cd dvd vhs camera camera_with_flash video_camera movie_camera projector " +
          "film_frames telephone_receiver telephone pager fax tv radio microphone2 level_slider control_knobs " +
          "stopwatch timer alarm_clock clock hourglass_flowing_sand hourglass satellite battery electric_plug bulb " +
          "flashlight candle wastebasket oil money_with_wings dollar yen euro pound moneybag credit_card gem scales " +
          "wrench hammer hammer_pick tools pick nut_and_bolt gear chains gun bomb knife dagger crossed_swords shield " +
          "smoking skull_crossbones coffin urn amphora crystal_ball prayer_beads barber alembic telescope microscope " +
          "hole pill syringe thermometer label bookmark toilet shower bathtub key key2 couch sleeping_accommodation " +
          "bed door bellhop frame_photo map beach_umbrella moyai shopping_bags balloon flags ribbon gift confetti_ball " +
          "tada dolls wind_chime crossed_flags izakaya_lantern envelope envelope_with_arrow incoming_envelope e-mail " +
          "love_letter postbox mailbox_closed mailbox mailbox_with_mail mailbox_with_no_mail package postal_horn " +
          "inbox_tray outbox_tray scroll page_with_curl bookmark_tabs bar_chart chart_with_upwards_trend " +
          "chart_with_downwards_trend page_facing_up date calendar calendar_spiral card_index card_box ballot_box " +
          "file_cabinet clipboard notepad_spiral file_folder open_file_folder dividers newspaper2 newspaper notebook " +
          "closed_book green_book blue_book orange_book notebook_with_decorative_cover ledger books book link " +
          "paperclip paperclips scissors triangular_ruler straight_ruler pushpin round_pushpin triangular_flag_on_post " +
          "flag_white flag_black closed_lock_with_key lock unlock lock_with_ink_pen pen_ballpoint pen_fountain " +
          "black_nib pencil pencil2 crayon paintbrush mag mag_right"
        },

        symbols: {
          icon: "heartpulse",
          title: "Symbols",
          emoji: "heart yellow_heart green_heart blue_heart purple_heart broken_heart heart_exclamation two_hearts " +
          "revolving_hearts heartbeat heartpulse sparkling_heart cupid gift_heart heart_decoration peace cross " +
          "star_and_crescent om_symbol wheel_of_dharma star_of_david six_pointed_star menorah yin_yang orthodox_cross " +
          "place_of_worship ophiuchus aries taurus gemini cancer leo virgo libra scorpius sagittarius capricorn " +
          "aquarius pisces id atom u7a7a u5272 radioactive biohazard mobile_phone_off vibration_mode u6709 u7121 " +
          "u7533 u55b6 u6708 eight_pointed_black_star vs accept white_flower ideograph_advantage secret congratulations " +
          "u5408 u6e80 u7981 a b ab cl o2 sos no_entry name_badge no_entry_sign x o anger hotsprings no_pedestrians " +
          "do_not_litter no_bicycles non-potable_water underage no_mobile_phones exclamation grey_exclamation question " +
          "grey_question bangbang interrobang 100 low_brightness high_brightness trident fleur-de-lis part_alternation_mark " +
          "warning children_crossing beginner recycle u6307 chart sparkle eight_spoked_asterisk negative_squared_cross_mark " +
          "white_check_mark diamond_shape_with_a_dot_inside cyclone loop globe_with_meridians m atm sa passport_control " +
          "customs baggage_claim left_luggage wheelchair no_smoking wc parking potable_water mens womens baby_symbol " +
          "restroom put_litter_in_its_place cinema signal_strength koko ng ok up cool new free zero one two three four " +
          "five six seven eight nine ten 1234 arrow_forward pause_button play_pause stop_button record_button track_next " +
          "track_previous fast_forward rewind twisted_rightwards_arrows repeat repeat_one arrow_backward arrow_up_small " +
          "arrow_down_small arrow_double_up arrow_double_down arrow_right arrow_left arrow_up arrow_down arrow_upper_right " +
          "arrow_lower_right arrow_lower_left arrow_upper_left arrow_up_down left_right_arrow arrows_counterclockwise " +
          "arrow_right_hook leftwards_arrow_with_hook arrow_heading_up arrow_heading_down hash asterisk information_source " +
          "abc abcd capital_abcd symbols musical_note notes wavy_dash curly_loop heavy_check_mark arrows_clockwise " +
          "heavy_plus_sign heavy_minus_sign heavy_division_sign heavy_multiplication_x heavy_dollar_sign currency_exchange " +
          "copyright registered tm end back on top soon ballot_box_with_check radio_button white_circle black_circle " +
          "red_circle large_blue_circle small_orange_diamond small_blue_diamond large_orange_diamond large_blue_diamond " +
          "small_red_triangle black_small_square white_small_square black_large_square white_large_square small_red_triangle_down " +
          "black_medium_square white_medium_square black_medium_small_square white_medium_small_square black_square_button " +
          "white_square_button speaker sound loud_sound mute mega loudspeaker bell no_bell black_joker mahjong spades " +
          "clubs hearts diamonds flower_playing_cards thought_balloon anger_right speech_balloon clock1 clock2 clock3 " +
          "clock4 clock5 clock6 clock7 clock8 clock9 clock10 clock11 clock12 clock130 clock230 clock330 clock430 " +
          "clock530 clock630 clock730 clock830 clock930 clock1030 clock1130 clock1230 eye_in_speech_bubble"
        },

        flags: {
          icon: "flag_gb",
          title: "Flags",
          emoji: "ac af al dz ad ao ai ag ar am aw au at az bs bh bd bb by be bz bj bm bt bo ba bw br bn bg bf bi " +
          "cv kh cm ca ky cf td flag_cl cn co km cg flag_cd cr hr cu cy cz dk dj dm do ec eg sv gq er ee et fk fo " +
          "fj fi fr pf ga gm ge de gh gi gr gl gd gu gt gn gw gy ht hn hk hu is in flag_id ir iq ie il it ci jm jp " +
          "je jo kz ke ki xk kw kg la lv lb ls lr ly li lt lu mo mk mg mw my mv ml mt mh mr mu mx fm md mc mn me " +
          "ms ma mz mm na nr np nl nc nz ni ne flag_ng nu kp no om pk pw ps pa pg py pe ph pl pt pr qa ro ru rw " +
          "sh kn lc vc ws sm st flag_sa sn rs sc sl sg sk si sb so za kr es lk sd sr sz se ch sy tw tj tz th tl " +
          "tg to tt tn tr flag_tm flag_tm ug ua ae gb us vi uy uz vu va ve vn wf eh ye zm zw re ax ta io bq cx " +
          "cc gg im yt nf pn bl pm gs tk bv hm sj um ic ea cp dg as aq vg ck cw eu gf tf gp mq mp sx ss tc "
        }
      }
    };
  };
  function isObject(variable) {
    return typeof variable === 'object';
  };
  function getOptions(options) {
    var default_options = getDefaultOptions();
    if (options && options['filters']) {
      var filters = default_options.filters;
      $.each(options['filters'], function(filter, data) {
        if (!isObject(data) || $.isEmptyObject(data)) {
          delete filters[filter];
          return;
        }
        $.each(data, function(key, val) {
          filters[filter][key] = val;
        });
      });
      options['filters'] = filters;
    }
    return $.extend({}, default_options, options);
  };

  var saveSelection, restoreSelection;
  if (window.getSelection && document.createRange) {
    saveSelection = function(el) {
      var sel = window.getSelection && window.getSelection();
      if (sel && sel.rangeCount > 0) {
        return sel.getRangeAt(0);
      }
    };

    restoreSelection = function(el, sel) {
      var range = document.createRange();
      range.setStart(sel.startContainer, sel.startOffset);
      range.setEnd(sel.endContainer, sel.endOffset)

      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } else if (document.selection && document.body.createTextRange) {
    saveSelection = function(el) {
      return document.selection.createRange();
    };

    restoreSelection = function(el, sel) {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.setStart(sel.startContanier, sel.startOffset);
      textRange.setEnd(sel.endContainer, sel.endOffset);
      textRange.select();
    };
  }


  var uniRegexp;
  function unicodeTo(str, template) {
    return str.replace(uniRegexp, function(unicodeChar) {
      var map = emojione[(emojioneSupportMode === 0 ? 'jsecapeMap' : 'jsEscapeMap')];
      if (typeof unicodeChar !== 'undefined' && unicodeChar in map) {
        return getTemplate(template, map[unicodeChar]);
      }
      return unicodeChar;
    });
  }
  function htmlFromText(str, self) {
    str = str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/`/g, '&#x60;')
        .replace(/(?:\r\n|\r|\n)/g, '\n')
        .replace(/(\n+)/g, '<div>$1</div>')
        .replace(/\n/g, '<br/>')
        .replace(/<br\/><\/div>/g, '</div>');
    if (self.shortnames) {
      str = emojione.shortnameToUnicode(str);
    }
    return unicodeTo(str, self.emojiTemplate)
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
        .replace(/  /g, '&nbsp;&nbsp;');
  }
  function textFromHtml(str, self) {
    str = str
        .replace(/<img[^>]*alt="([^"]+)"[^>]*>/ig, '$1')
        .replace(/\n|\r/g, '')
        .replace(/<br[^>]*>/ig, '\n')
        .replace(/(?:<(?:div|p|ol|ul|li|pre|code|object)[^>]*>)+/ig, '<div>')
        .replace(/(?:<\/(?:div|p|ol|ul|li|pre|code|object)>)+/ig, '</div>')
        .replace(/\n<div><\/div>/ig, '\n')
        .replace(/<div><\/div>\n/ig, '\n')
        .replace(/(?:<div>)+<\/div>/ig, '\n')
        .replace(/([^\n])<\/div><div>/ig, '$1\n')
        .replace(/(?:<\/div>)+/ig, '</div>')
        .replace(/([^\n])<\/div>([^\n])/ig, '$1\n$2')
        .replace(/<\/div>/ig, '')
        .replace(/([^\n])<div>/ig, '$1\n')
        .replace(/\n<div>/ig, '\n')
        .replace(/<div>\n/ig, '\n\n')
        .replace(/<(?:[^>]+)?>/g, '')
        .replace(new RegExp(invisibleChar, 'g'), '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x60;/g, '`')
        .replace(/&amp;/g, '&');

    switch (self.saveEmojisAs) {
      case 'image':
        str = unicodeTo(str, self.emojiTemplate);
        break;
      case 'shortname':
        str = emojione.toShort(str);
    }
    return str;
  }
  function calcButtonPosition() {
    var self = this,
        offset = self.editor[0].offsetWidth - self.editor[0].clientWidth,
        current = parseInt(self.button.css('marginRight'));
    if (current !== offset) {
      self.button.css({marginRight: offset});
      if (self.floatingPicker) {
        self.picker.css({right: parseInt(self.picker.css('right')) - current + offset});
      }
    }
  }
  function lazyLoading() {
    var self = this;
    if (!self.sprite && self.lasyEmoji[0]) {
      var pickerTop = self.picker.offset().top,
          pickerBottom = pickerTop + self.picker.height() + 20;
      self.lasyEmoji.each(function() {
        var e = $(this), top = e.offset().top;
        if (top > pickerTop && top < pickerBottom) {
          e.attr("src", e.data("src")).removeClass("lazy-emoji");
        }
      })
      self.lasyEmoji = self.lasyEmoji.filter(".lazy-emoji");
    }
  }
  function selector (prefix, skip_dot) {
    return (skip_dot ? '' : '.') + css_class + (prefix ? ("-" + prefix) : "");
  }
  function div(prefix) {
    var parent = $('<div/>', isObject(prefix) ? prefix : {"class" : selector(prefix, true)});
    $.each(slice.call(arguments).slice(1), function(i, child) {
      if ($.isFunction(child)) {
        child = child.call(parent);
      }
      if (child) {
        $(child).appendTo(parent);
      }
    });
    return parent;
  }
  function getRecent () {
    return localStorage.getItem("recent_emojis") || "";
  }
  function updateRecent(self) {
    var emojis = getRecent();
    if (!self.recent || self.recent !== emojis) {
      if (emojis.length) {
        var skinnable = self.scrollArea.is(".skinnable"),
            scrollTop, height;

        if (!skinnable) {
          scrollTop = self.scrollArea.scrollTop();
          height = self.recentCategory.is(":visible") ? self.recentCategory.height() : 0;
        }

        var items = shortnameTo(emojis, self.emojiBtnTemplate, true).split('|').join('');
        self.recentCategory.children(".emojibtn").remove();
        $(items).insertAfter(self.recentCategory.children("h1"));


        self.recentCategory.children(".emojibtn").on("click", function() {
          self.trigger("emojibtn.click", $(this));
        });

        self.recentFilter.show();

        if (!skinnable) {
          self.recentCategory.show();

          var height2 = self.recentCategory.height();

          if (height !== height2) {
            self.scrollArea.scrollTop(scrollTop + height2 - height);
          }
        }
      } else {
        if (self.recentFilter.hasClass("active")) {
          self.recentFilter.removeClass("active").next().addClass("active");
        }
        self.recentCategory.hide();
        self.recentFilter.hide();
      }
      self.recent = emojis;
    }
  };
  function setRecent(self, emoji) {
    var recent = getRecent();
    var emojis = recent.split("|");

    var index = emojis.indexOf(emoji);
    if (index !== -1) {
      emojis.splice(index, 1);
    }
    emojis.unshift(emoji);

    if (emojis.length > 9) {
      emojis.pop();
    }

    localStorage.setItem("recent_emojis", emojis.join("|"));

    updateRecent(self);
  };
// see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
  function supportsLocalStorage () {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }
  function init(self, source, options) {
    //calcElapsedTime('init', function() {
    options = getOptions(options);
    self.sprite = options.sprite && emojioneSupportMode < 3;
    self.inline = options.inline === null ? source.is("INPUT") : options.inline;
    self.shortnames = options.shortnames;
    self.saveEmojisAs = options.saveEmojisAs;
    self.standalone = options.standalone;
    self.emojiTemplate = '<img alt="{alt}" class="emojione' + (self.sprite ? '-{uni}" src="' + blankImg + '"/>' : 'emoji" src="{img}"/>');
    self.emojiTemplateAlt = self.sprite ? '<i class="emojione-{uni}"/>' : '<img class="emojioneemoji" src="{img}"/>';
    self.emojiBtnTemplate = '<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}">' + self.emojiTemplateAlt + '</i>';
    self.recentEmojis = options.recentEmojis && supportsLocalStorage();

    var pickerPosition = options.pickerPosition;
    self.floatingPicker = pickerPosition === 'top' || pickerPosition === 'bottom';

    var sourceValFunc = source.is("TEXTAREA") || source.is("INPUT") ? "val" : "text",
        editor, button, picker, tones, filters, filtersBtns, search, emojisList, categories, scrollArea,
        app = div({
              "class" : css_class + ((self.standalone) ? " " + css_class + "-standalone " : " ") + (source.attr("class") || ""),
              role: "application"
            },
            editor = self.editor = div("editor").attr({
              contenteditable: (self.standalone) ? false : true,
              placeholder: options["placeholder"] || source.data("placeholder") || source.attr("placeholder") || "",
              tabindex: 0
            }),
            button = self.button = div('button',
                div('button-open'),
                div('button-close')
            ).attr('title', options.buttonTitle),
            picker = self.picker = div('picker',
                div('wrapper',
                    filters = div('filters'),
                    search = div('search',
                        function() {
                          self.search = $("<input/>", {
                            "placeholder": "SEARCH",
                            "type": "text",
                            "class": "search"
                          });
                          this.append(self.search);
                        }
                    ),
                    tones = div('tones',
                        function() {
                          if (options.tones) {
                            this.addClass(selector('tones-' + options.tonesStyle, true));
                            for (var i = 0; i <= 5; i++) {
                              this.append($("<i/>", {
                                "class": "btn-tone btn-tone-" + i + (!i ? " active" : ""),
                                "data-skin": i,
                                role: "button"
                              }));
                            }
                          }
                        }
                    ),
                    scrollArea = div('scroll-area',
                        emojisList = div('emojis-list')
                    )
                )
            ).addClass(selector('picker-position-' + options.pickerPosition, true))
                .addClass(selector('filters-position-' + options.filtersPosition, true))
                .addClass('hidden')
        );

    self.searchSel = null;

    editor.data(source.data());

    $.each(options.attributes, function(attr, value) {
      editor.attr(attr, value);
    });

    $.each(options.filters, function(filter, params) {
      var skin = 0;
      if (filter === 'recent' && !self.recentEmojis) {
        return;
      }
      if (filter !== 'tones') {
        $("<i/>", {
          "class": selector("filter", true) + " " + selector("filter-" + filter, true),
          "data-filter": filter,
          title: params.title
        })
            .wrapInner(shortnameTo(params.icon, self.emojiTemplateAlt))
            .appendTo(filters);
      } else if (options.tones) {
        skin = 5;
      } else {
        return;
      }
      do {
        var category = div('category').attr({name: filter, "data-tone": skin}).appendTo(emojisList),
            items = params.emoji.replace(/[\s,;]+/g, '|');
        if (skin > 0) {
          category.hide();
          items = items.split('|').join('_tone' + skin + '|') + '_tone' + skin;
        }

        if (filter === 'recent') {
          items = getRecent();
        }

        items = shortnameTo(items,
            self.sprite ?
                '<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}"><i class="emojione-{uni}"></i></i>' :
                '<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}"><img class="emojioneemoji lazy-emoji" data-src="{img}"/></i>',
            true).split('|').join('');

        category.html(items);
        $('<h1/>').text(params.title).prependTo(category);
      } while (--skin > 0);
    });

    options.filters = null;
    if (!self.sprite) {
      self.lasyEmoji = emojisList.find(".lazy-emoji");
    }

    filtersBtns = filters.find(selector("filter"));
    filtersBtns.eq(0).addClass("active");
    categories = emojisList.find(selector("category"));

    self.recentFilter = filtersBtns.filter('[data-filter="recent"]');
    self.recentCategory = categories.filter("[name=recent]");

    self.scrollArea = scrollArea;

    if (options.container) {
      $(options.container).wrapInner(app);
    } else {
      app.insertAfter(source);
    }

    if (options.hideSource) {
      source.hide();
    }

    self.setText(source[sourceValFunc]());
    source[sourceValFunc](self.getText());
    calcButtonPosition.apply(self);

    // if in standalone mode and no value is set, initialise with a placeholder
    if (self.standalone && !self.getText().length) {
      var placeholder = $(source).data("emoji-placeholder") || options.emojiPlaceholder;
      self.setText(placeholder);
      editor.addClass("has-placeholder");
    }

    // attach() must be called before any .on() methods !!!
    // 1) attach() stores events into possibleEvents{},
    // 2) .on() calls bindEvent() and stores handlers into eventStorage{},
    // 3) bindEvent() finds events in possibleEvents{} and bind founded via jQuery.on()
    // 4) attached events via jQuery.on() calls trigger()
    // 5) trigger() calls handlers stored into eventStorage{}

    attach(self, emojisList.find(".emojibtn"), {click: "emojibtn.click"});
    attach(self, window, {resize: "!resize"});
    attach(self, tones.children(), {click: "tone.click"});
    attach(self, [picker, button], {mousedown: "!mousedown"}, editor);
    attach(self, button, {click: "button.click"});
    attach(self, editor, {paste :"!paste"}, editor);
    attach(self, editor, ["focus", "blur"], function() { return self.stayFocused ? false : editor } );
    attach(self, picker, {mousedown: "picker.mousedown", mouseup: "picker.mouseup", click: "picker.click",
      keyup: "picker.keyup", keydown: "picker.keydown", keypress: "picker.keypress"});
    attach(self, editor, ["mousedown", "mouseup", "click", "keyup", "keydown", "keypress"]);
    attach(self, picker.find(".emojionearea-filter"), {click: "filter.click"});
    attach(self, self.search, {keyup: "search.keypress", focus: "search.focus", blur: "search.blur"});

    var noListenScroll = false;
    scrollArea.on('scroll', function () {
      if (!noListenScroll) {
        lazyLoading.call(self);
        if (scrollArea.is(":not(.skinnable)")) {
          var item = categories.eq(0), scrollTop = scrollArea.offset().top;
          categories.each(function (i, e) {
            if ($(e).offset().top - scrollTop >= 10) {
              return false;
            }
            item = $(e);
          });
          var filter = filtersBtns.filter('[data-filter="' + item.attr("name") + '"]');
          if (filter[0] && !filter.is(".active")) {
            filtersBtns.removeClass("active");
            filter.addClass("active");
          }
        }
      }
    });

    self.on("@filter.click", function(filter) {
      var isActive = filter.is(".active");
      if (scrollArea.is(".skinnable")) {
        if (isActive) return;
        tones.children().eq(0).click();
      }
      noListenScroll = true;
      if (!isActive) {
        filtersBtns.filter(".active").removeClass("active");
        filter.addClass("active");
      }
      var headerOffset = categories.filter('[name="' + filter.data('filter') + '"]').offset().top,
          scroll = scrollArea.scrollTop(),
          offsetTop = scrollArea.offset().top;
      scrollArea.stop().animate({
        scrollTop: headerOffset + scroll - offsetTop - 2
      }, 200, 'swing', function () {
        lazyLoading.call(self);
        noListenScroll = false;
      });
    })

        .on("@picker.show", function() {
          if (self.recentEmojis) {
            updateRecent(self);
          }
          lazyLoading.call(self);
        })

        .on("@tone.click", function(tone) {
          tones.children().removeClass("active");
          var skin = tone.addClass("active").data("skin");
          if (skin) {
            scrollArea.addClass("skinnable");
            categories.hide().filter("[data-tone=" + skin + "]").show();
            if (filtersBtns.eq(0).is('.active[data-filter="recent"]')) {
              filtersBtns.eq(0).removeClass("active").next().addClass("active");
            }
          } else {
            scrollArea.removeClass("skinnable");
            categories.hide().filter("[data-tone=0]").show();
            filtersBtns.eq(0).click();
          }
          lazyLoading.call(self);
        })

        .on("@button.click", function(button) {
          if (button.is(".active")) {
            self.hidePicker();
          } else {
            self.showPicker();
            self.searchSel = null;
          }
        })

        .on("@!paste", function(editor, event) {

          var pasteText = function(text) {
            var caretID = "caret-" + (new Date()).getTime();
            var html = htmlFromText(text, self);
            pasteHtmlAtCaret(html);
            pasteHtmlAtCaret('<i id="' + caretID +'"></i>');
            editor.scrollTop(editorScrollTop);
            var caret = $("#" + caretID),
                top = caret.offset().top - editor.offset().top,
                height = editor.height();
            if (editorScrollTop + top >= height || editorScrollTop > top) {
              editor.scrollTop(editorScrollTop + top - 2 * height/3);
            }
            caret.remove();
            self.stayFocused = false;
            calcButtonPosition.apply(self);
            trigger(self, 'paste', [editor, text, html]);
          }

          if (event.originalEvent.clipboardData) {
            var text = event.originalEvent.clipboardData.getData('text/plain');
            pasteText(text);

            if (event.preventDefault){
              event.preventDefault();
            } else {
              event.stop();
            };

            event.returnValue = false;
            event.stopPropagation();
            return false;
          }

          self.stayFocused = true;
          // insert invisible character for fix caret position
          pasteHtmlAtCaret('<span>' + invisibleChar + '</span>');

          var sel = saveSelection(editor[0]),
              editorScrollTop = editor.scrollTop(),
              clipboard = $("<div/>", {contenteditable: true})
                  .css({position: "fixed", left: "-999px", width: "1px", height: "1px", top: "20px", overflow: "hidden"})
                  .appendTo($("BODY"))
                  .focus();

          window.setTimeout(function() {
            editor.focus();
            restoreSelection(editor[0], sel);
            var text = textFromHtml(clipboard.html().replace(/\r\n|\n|\r/g, '<br>'), self);
            clipboard.remove();
            pasteText(text);
          }, 200);
        })

        .on("@emojibtn.click", function(emojibtn) {
          editor.removeClass("has-placeholder");

          if (self.searchSel !== null) {
            editor.focus();
            restoreSelection(editor[0], self.searchSel);
            self.searchSel = null;
          }

          if (self.standalone) {
            editor.html(shortnameTo(emojibtn.data("name"), self.emojiTemplate));
            self.trigger("blur");
          } else {
            saveSelection(editor[0]);
            pasteHtmlAtCaret(shortnameTo(emojibtn.data("name"), self.emojiTemplate));
          }

          if (self.recentEmojis) {
            setRecent(self, emojibtn.data("name"));
          }

          self.search.val('');
          self.trigger('search.keypress');
        })

        .on("@!resize @keyup @emojibtn.click", calcButtonPosition)

        .on("@!mousedown", function(editor, event) {
          if ($(event.target).hasClass('search')) {
            // Allow search clicks
            self.stayFocused = true;
            if (self.searchSel == null) {
              self.searchSel = saveSelection(editor[0]);
            }
          } else {
            if (!app.is(".focused")) {
              editor.focus();
            }
            event.preventDefault();
          }
          return false;
        })

        .on("@change", function() {
          var html = self.editor.html().replace(/<\/?(?:div|span|p)[^>]*>/ig, '');
          // clear input: chrome adds <br> when contenteditable is empty
          if (!html.length || /^<br[^>]*>$/i.test(html)) {
            self.editor.html(self.content = '');
          }
          source[sourceValFunc](self.getText());
        })

        .on("@focus", function() {
          app.addClass("focused");
        })

        .on("@blur", function() {
          app.removeClass("focused");

          if (options.hidePickerOnBlur) {
            self.hidePicker();
          }

          var content = self.editor.html();
          if (self.content !== content) {
            self.content = content;
            trigger(self, 'change', [self.editor]);
            source.blur().trigger("change");
          } else {
            source.blur();
          }

          self.search.val('');
          self.trigger('search.keypress');
        })

        .on("@search.focus", function() {
          self.stayFocused = true;
          self.search.addClass("focused");
        })

        .on("@search.keypress", function() {
          var filterBtns = picker.find(".emojionearea-filter");

          var term = self.search.val().replace( / /g, "_" ).replace(/"/g, "\\\"");
          if (term !== "") {
            categories.filter('[data-tone="' + tones.find("i.active").data("skin") + '"]:not([name="recent"])').each(function() {
              var $category = $(this);
              var $matched = $category.find('.emojibtn[data-name*="' + term + '"]');
              if ($matched.length === 0) {
                $category.hide();
                filterBtns.filter('[data-filter="' + $category.attr('name') + '"]').hide();
              } else {
                var $notMatched = $category.find('.emojibtn:not([data-name*="' + term + '"])')
                $notMatched.hide();

                $matched.show();
                $category.show();
                filterBtns.filter('[data-filter="' + $category.attr('name') + '"]').show();
              }
            });
            if (!noListenScroll) {
              scrollArea.trigger('scroll');
            } else {
              lazyLoading.call(self);
            }
          } else {
            categories.filter('[data-tone="' + tones.find("i.active").data("skin") + '"]:not([name="recent"])').show();
            $('.emojibtn', categories).show();
            filterBtns.show();
          }
        })

        .on("@search.blur", function() {
          self.stayFocused = false;
          self.search.removeClass("focused");
          self.trigger("blur");
        });

    if (options.shortcuts) {
      self.on("@keydown", function(_, e) {
        if (!e.ctrlKey) {
          if (e.which == 9) {
            e.preventDefault();
            button.click();
          }
          else if (e.which == 27) {
            e.preventDefault();
            if (button.is(".active")) {
              self.hidePicker();
            }
          }
        }
      });
    }

    if (isObject(options.events) && !$.isEmptyObject(options.events)) {
      $.each(options.events, function(event, handler) {
        self.on(event.replace(/_/g, '.'), handler);
      });
    }

    if (options.autocomplete) {
      var autocomplete = function() {
        var textcompleteOptions = {
          maxCount: options.textcomplete.maxCount,
          placement: options.textcomplete.placement
        };

        if (options.shortcuts) {
          textcompleteOptions.onKeydown = function (e, commands) {
            if (!e.ctrlKey && e.which == 13) {
              return commands.KEY_ENTER;
            }
          };
        }

        var map = $.map(emojione.emojioneList, function (_, emoji) {
          return !options.autocompleteTones ? /_tone[12345]/.test(emoji) ? null : emoji : emoji;
        });
        map.sort();
        editor.textcomplete([
          {
            id: css_class,
            match: /\B(:[\-+\w]*)$/,
            search: function (term, callback) {
              callback($.map(map, function (emoji) {
                return emoji.indexOf(term) === 0 ? emoji : null;
              }));
            },
            template: function (value) {
              return shortnameTo(value, self.emojiTemplate) + " " + value.replace(/:/g, '');
            },
            replace: function (value) {
              return shortnameTo(value, self.emojiTemplate);
            },
            cache: true,
            index: 1
          }
        ], textcompleteOptions);

        if (options.textcomplete.placement) {
          // Enable correct positioning for textcomplete
          if ($(editor.data('textComplete').option.appendTo).css("position") == "static") {
            $(editor.data('textComplete').option.appendTo).css("position", "relative");
          }
        }
      };
      if ($.fn.textcomplete) {
        autocomplete();
      } else {
        $.getScript("https://cdn.rawgit.com/yuku-t/jquery-textcomplete/v1.3.4/dist/jquery.textcomplete.js",
            autocomplete);
      }
    }

    if (self.inline) {
      app.addClass(selector('inline', true));
      self.on("@keydown", function(_, e) {
        if (e.which == 13) {
          e.preventDefault();
        }
      });
    }

    if (/firefox/i.test(navigator.userAgent)) {
      // disabling resize images on Firefox
      document.execCommand("enableObjectResizing", false, false);
    }

    //}, self.id === 1); // calcElapsedTime()
  };
  var emojioneVersion = window.emojioneVersion || '2.1.4';
  var cdn = {
    defaultBase: "https://cdnjs.cloudflare.com/ajax/libs/emojione/",
    base: null,
    isLoading: false
  };
  function loadEmojione(options) {

    function detectVersion(emojione) {
      var version = emojione.cacheBustParam;
      if (!isObject(emojione['jsEscapeMap'])) return '1.5.2';
      if (version === "?v=1.2.4") return '2.0.0';
      if (version === "?v=2.0.1") return '2.1.0'; // v2.0.1 || v2.1.0
      if (version === "?v=2.1.1") return '2.1.1';
      if (version === "?v=2.1.2") return '2.1.2';
      if (version === "?v=2.1.3") return '2.1.3';
      if (version === "?v=2.1.4") return '2.1.4';
      if (version === "?v=2.2.7") return '2.2.7';
      return '2.2.7';
    }

    function getSupportMode(version) {
      switch (version) {
        case '1.5.2': return 0;
        case '2.0.0': return 1;
        case '2.1.0':
        case '2.1.1': return 2;
        case '2.1.2': return 3;
        case '2.1.3':
        case '2.1.4':
        case '2.2.7':
        default: return 4;
      }
    }
    options = getOptions(options);

    if (!cdn.isLoading) {
      if (!emojione || getSupportMode(detectVersion(emojione)) < 2) {
        cdn.isLoading = true;
        $.getScript(cdn.defaultBase + emojioneVersion + "/lib/js/emojione.min.js", function () {
          emojione = window.emojione;
          emojioneVersion = detectVersion(emojione);
          emojioneSupportMode = getSupportMode(emojioneVersion);
          cdn.base = cdn.defaultBase + emojioneVersion + "/assets";
          if (options.sprite) {
            var sprite = cdn.base + "/sprites/emojione.sprites.css";
            if (document.createStyleSheet) {
              document.createStyleSheet(sprite);
            } else {
              $('<link/>', {rel: 'stylesheet', href: sprite}).appendTo('head');
            }
          }
          while (readyCallbacks.length) {
            readyCallbacks.shift().call();
          }
          cdn.isLoading = false;
        });
      } else {
        emojioneVersion = detectVersion(emojione);
        emojioneSupportMode = getSupportMode(emojioneVersion);
        cdn.base = cdn.defaultBase + emojioneVersion + "/assets";
      }
    }

    emojioneReady(function() {
      if (options.useInternalCDN) {
        emojione.imagePathPNG = cdn.base + "/png/";
        emojione.imagePathSVG = cdn.base + "/svg/";
        emojione.imagePathSVGSprites = cdn.base + "/sprites/emojione.sprites.svg";
        emojione.imageType = options.imageType;
      }

      uniRegexp = new RegExp("<object[^>]*>.*?<\/object>|<span[^>]*>.*?<\/span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|(" + emojione.unicodeRegexp + ")", "gi");
    });
  };
  var EmojioneArea = function(element, options) {
    var self = this;
    loadEmojione(options);
    eventStorage[self.id = ++unique] = {};
    possibleEvents[self.id] = {};
    emojioneReady(function() {
      init(self, element, options);
    });
  };

  var loadSmyles = function (element, options) {

    emojioneReady(function() {
      element.html(emojione.shortnameToImage(element.html()))
    });
  };
  function bindEvent(self, event) {
    event = event.replace(/^@/, '');
    var id = self.id;
    if (possibleEvents[id][event]) {
      $.each(possibleEvents[id][event], function(i, ev) {
        // ev[0] = element
        // ev[1] = event
        // ev[2] = target
        $.each($.isArray(ev[0]) ? ev[0] : [ev[0]], function(i, el) {
          $(el).on(ev[1], function() {
            var args = slice.call(arguments),
                target = $.isFunction(ev[2]) ? ev[2].apply(self, [event].concat(args)) : ev[2];
            if (target) {
              trigger(self, event, [target].concat(args));
            }
          });
        });
      });
      possibleEvents[id][event] = null;
    }
  }

  EmojioneArea.prototype.on = function(events, handler) {
    if (events && $.isFunction(handler)) {
      var self = this;
      $.each(events.toLowerCase().split(' '), function(i, event) {
        bindEvent(self, event);
        (eventStorage[self.id][event] || (eventStorage[self.id][event] = [])).push(handler);
      });
    }
    return this;
  };

  EmojioneArea.prototype.off = function(events, handler) {
    if (events) {
      var id = this.id;
      $.each(events.toLowerCase().replace(/_/g, '.').split(' '), function(i, event) {
        if (eventStorage[id][event] && !/^@/.test(event)) {
          if (handler) {
            $.each(eventStorage[id][event], function(j, fn) {
              if (fn === handler) {
                eventStorage[id][event] = eventStorage[id][event].splice(j, 1);
              }
            });
          } else {
            eventStorage[id][event] = [];
          }
        }
      });
    }
    return this;
  };

  EmojioneArea.prototype.trigger = function() {
    var args = slice.call(arguments),
        call_args = [this].concat(args.slice(0,1));
    call_args.push(args.slice(1));
    return trigger.apply(this, call_args);
  };

  EmojioneArea.prototype.setFocus = function () {
    var self = this;
    emojioneReady(function () {
      self.editor.focus();
    });
    return self;
  };

  EmojioneArea.prototype.setText = function (str) {
    var self = this;
    emojioneReady(function () {
      self.editor.html(htmlFromText(str, self));
      self.content = self.editor.html();
      trigger(self, 'change', [self.editor]);
      calcButtonPosition.apply(self);
    });
    return self;
  }

  EmojioneArea.prototype.getText = function() {
    return textFromHtml(this.editor.html(), this);
  }

  EmojioneArea.prototype.showPicker = function () {
    var self = this;
    if (self._sh_timer) {
      window.clearTimeout(self._sh_timer);
    }
    self.picker.removeClass("hidden");
    self._sh_timer =  window.setTimeout(function() {
      self.button.addClass("active");
    }, 50);
    trigger(self, "picker.show", [self.picker]);
    return self;
  }

  EmojioneArea.prototype.hidePicker = function () {
    var self = this;
    if (self._sh_timer) {
      window.clearTimeout(self._sh_timer);
    }
    self.button.removeClass("active");
    self._sh_timer =  window.setTimeout(function() {
      self.picker.addClass("hidden");
    }, 500);
    trigger(self, "picker.hide", [self.picker]);
    return self;
  }

  EmojioneArea.prototype.enable = function () {
    var self = this;
    emojioneReady(function () {
      self.editor.prop('contenteditable', true);
      self.button.show();
    });
    return self;
  }

  EmojioneArea.prototype.disable = function () {
    var self = this;
    emojioneReady(function () {
      self.editor.prop('contenteditable', false);
      self.hidePicker();
      self.button.hide();
    });
    return self;
  }

  $.fn.emojioneArea = function(options) {
    return this.each(function() {
      if (!!this.emojioneArea) return this.emojioneArea;
      $.data(this, 'emojioneArea', this.emojioneArea = new EmojioneArea($(this), options));
      return this.emojioneArea;
    });
  };

  $.fn.emojioneReplace = function(options) {
    loadEmojione(options);
    var self = this;
    setTimeout(function () {
      return self.each(function() {
        new loadSmyles($(this), options);
      });
    }, 200)
  };

  $.fn.emojioneArea.defaults = getDefaultOptions();

  $.fn.emojioneAreaText = function(options) {
    var self = this, pseudoSelf = {
      shortnames: (options && typeof options.shortnames !== 'undefined' ? options.shortnames : true),
      emojiTemplate: '<img alt="{alt}" class="emojione' + (options && options.sprite && emojioneSupportMode < 3 ? '-{uni}" src="' + blankImg : 'emoji" src="{img}') + '"/>'
    };

    loadEmojione(options);
    emojioneReady(function() {
      self.each(function() {
        var $this = $(this);
        if (!$this.hasClass('emojionearea-text')) {
          $this.addClass('emojionearea-text').html(htmlFromText(($this.is('TEXTAREA') || $this.is('INPUT') ? $this.val() : $this.text()), pseudoSelf));
        }
        return $this;
      });
    });

    return this;
  };

}, window ) );




$(document).ready(function() {

  logged = $('input[name=isLogged]').val();

  if(location.hostname == 'gomakoil'){
    if( location.href.indexOf('sasha') >= 0 ){
      HTTP_BASE_PATH = "http://gomakoil/modules/sasha/test/myprestareviews/public/";
      HTTP_BASE_PATH = "http://myprestareviews.yura/";
    }
    else{
      HTTP_BASE_PATH = "http://gomakoil/modules/yura/test/myprestareviews/public/";
    }
  }
  else{
    HTTP_BASE_PATH = "https://myprestareviews.com/";
  }

  $(document).scroll(function () {
    if($('.reviews-tab-content-form .modalFormReviews.active').length>0){
      scrollFormReviews($('.reviews-tab-content-form .modalFormReviews'), 0);
    }
  });

  setTimeout(function () {
    if($('.question_message').length>0){
      $(".question_message").emojioneReplace();
    };

    if($('.customer_new_question').length>0){
      $(".customer_new_question").emojioneArea();
    };

    if($('.base_review').length>0){
      $(".item_reply_content").emojioneReplace();
      $(".review_main_container .base_review").emojioneReplace();
    };

    if($('.dedicated_review_main').length>0){
      $(".dedicated_reviews_list .dedicated_review_main").emojioneReplace();
    };

  }, 500);




  $(document).on('click', '.add_question_form', function(){
    sendNewQuestion($(this).attr('data-id'));
  });

  $('.block_form_new_question #attachment_new_question').change(function() {
    if ($(this).val() != '') {
      $(this).prev().addClass('active');
      $(this).parents('.new_question_photo').find('.attachment_new_question_label').addClass('active');
    } else {
      $(this).prev().removeClass('active');
      $(this).parents('.new_question_photo').find('.attachment_new_question_label').removeClass('active');
    }
  });


  $(document).on('click', ".notificationsMessageClose2, .notificationsBlockOverlay2", function(){
    hideMessages2();
  });

  $(document).on('click', ".notificationsMessageClose, .notificationsBlockOverlay", function(){
    hideMessages();
  });


  $(document).on('mouseover', '.star_block .rating_reviews label', function(){
    replaceStars($(this).attr('data-value'));
  })

  $(document).on('mouseout', '.star_block .rating_reviews label', function(){
    replaceStars($('.star_block .rating_reviews input[name=rating]:checked').val());
  })

  $(document).on('click', '.share_buttons_front', function(){
    if($(this).next().hasClass('active')){
      $(this).next().removeClass('active')
    }
    else{
      $(this).next().addClass('active')
    }
  });

  $(document).on('click', '.star_block .rating_reviews label input', function(){
    replaceStars($(this).val());
    $('.status_rating').html($(this).parents('.full').attr('title'));
  });

  $(document).on('change', '#notify_reviews', function(){

    if($(this).is(':checked')){
      $(this).parents('.notify_reviews_block').addClass('checked');
    }
    else {
      $(this).parents('.notify_reviews_block').removeClass('checked');
    }

  });

  $(document).on('change', '#notify_reviews_gdpr', function(){
    if($(this).is(':checked')){
      $(this).parents('.notify_reviews_gdpr_block').addClass('checked');
    }
    else {
      $(this).parents('.notify_reviews_gdpr_block').removeClass('checked');
    }
  });



  $(document).on('change', '.notify_reply_gdpr_block input', function(){
    if($(this).is(':checked')){
      $(this).parent().addClass('checked');
    }
    else {
      $(this).parent().removeClass('checked');
    }
  });



  $(document).on('change', '#notify_question_gdpr', function(){
    if($(this).is(':checked')){
      $(this).parents('.notify_question_gdpr_block').addClass('checked');
    }
    else {
      $(this).parents('.notify_question_gdpr_block').removeClass('checked');
    }
  });


  if ($('.reviews-tab-content .fancybox').fancybox) {
    $('.reviews-tab-content .fancybox').fancybox({
      hideOnContentClick: false,
      helpers: {
        overlay: {
          locked: false
        }
      }
    });
  }

});



$(document).ready(function(){

  emojioneAreaRiviews = 0;
  emojioneAreaQuestions = 0;


  setTimeout(function () {
    paginationPageActive();
  }, 200);

  $(document).on('click', '.sort_dedicated_reviews li', function(){
    var dedicated_reviews_type = $('.dedicated_reviews_tab_item.active').attr('data-tab');
    $('.sort_dedicated_reviews li').removeClass('selected');
    $(this).addClass('selected');
    reviewsPagination('pagination', 1, dedicated_reviews_type);
  });

  $(document).on('click', '.sortByList li ', function(){
    $('.sortByList li ').removeClass('active');
    $(this).addClass('active');
    reviewsPagination('pagination', 1, 0);
  });


  $(document).on('click', '.reviews_pagination li', function(){
    reviewsPagination('pagination', $(this).find('a').attr('data-p'), 0);
  });

  $(document).on('click', '.dedicated_reviews_pagination li', function(e){
    var def_order_by = $('.sort_dedicated_reviews').attr('data-default-order-by');
    if($('.sort_dedicated_reviews').val() !== def_order_by){
      e.preventDefault();
      var dedicated_reviews_type = $('.dedicated_reviews_tab_item.active').attr('data-tab');
      reviewsPagination('pagination', $(this).find('a').attr('data-p'), dedicated_reviews_type);
    }
  });

  $(document).on('click', '.block_load_more', function(){
    var page = parseInt($(this).attr('data-page')) + 1;
    $(this).attr('data-page', page);
    reviewsPagination('load_more', page, 0);
  });

  $(document).on('click', '.dedicated_reviews_block_load_more', function(){
    var page = parseInt($(this).attr('data-page')) + 1;
    $(this).attr('data-page', page);
    var dedicated_reviews_type = $('.dedicated_reviews_tab_item.active').attr('data-tab');
    reviewsPagination('load_more', page, dedicated_reviews_type);
  });

  $(document).on('change', '.reviews-tab-content .recommend_button input[name=recommend]', function(){
    $('.recommend_button label').removeClass('active');
    if($(this).val() == 1){
      $('.recommend_button .recommend_no').addClass('active');
    }
    else if($(this).val() == 2){
      $('.recommend_button .recommend_yes').addClass('active');
    }
    else{
      $('.recommend_button .recommend_no').addClass('active');
    }
  });




  $(document).on('click', '.reviews-tab-content .block_icon_like.logged a', function(){

    var id = $(this).attr('data-id');
    var type = $(this).attr('data-type');

    var like = getCookie("idReviews_"+id);

    if(like && like == type){
      return false;
    }

    if(like && like !== type ){
      updateLike(id, type, 1, 1);
    }

    if(!like){
      if(type == 'like'){
        updateLike(id, type, 1, 0);
      }
      if(type == 'dislike'){
        updateLike(id, type, 0, 1);
      }
    }

  });

  $(document).on('click', '.reviews-tab-content .quickview_close, .modalBackdrop', function(){
    $('.modal_quickview').removeClass('active');
    $('.modalBackdrop').removeClass('active');
  });

  window.onload = function() {
    if (window.addEventListener) window.addEventListener("DOMMouseScroll", mouse_wheel, false);
    window.onmousewheel = document.onmousewheel = mouse_wheel;
  }

  var mouse_wheel = function(event) {
    if (false == !!event) event = window.event;
    direction = ((event.wheelDelta) ? event.wheelDelta/120 : event.detail/-3) || false;
  }

  $(document).on('change', '.reviews-tab-content .item_block_photo #attachment', function(){
    if ($(this).val() != '') {
      $(this).prev().addClass('active')
      $(this).parents('.item_block_photo').find('.attachment_label').addClass('active');
    } else {
      $(this).prev().removeClass('active');
      $(this).parents('.item_block_photo').find('.attachment_label').removeClass('active');
    }
  });


  $(document).on('change', '.reviews-tab-content .item_block_photo #attachment_question', function(){
    if ($(this).val() != '') {
      $(this).prev().addClass('active')
      $(this).parents('.item_block_photo').find('.attachment_label').addClass('active')
    } else {
      $(this).prev().removeClass('active');
      $(this).parents('.item_block_photo').find('.attachment_label').removeClass('active');
    }
  });

  $(document).on('click', '.reviews-tab-content .button_form_add_question', function(){
    addNewQuestion();
  });

  $(document).on('click', '.reviews-tab-content .button_form_add', function(){
    addNewReview();
  });

  $(document).on('click', '.reviews-tab-content .add_reaply', function(){

    if($(this).hasClass('error_logged')){
      showErrorMessage($('.notification_labels .reviews_label_74').val());
      return false;
    }

    var id = $(this).attr('data-id');
    $('.content_item_form_reply.item_form_reply_'+id).addClass('active');
  });

  $(document).on('click', '.reviews-tab-content .cancel_reply', function(){
    var id = $(this).attr('data-id');
    $('.content_item_form_reply.item_form_reply_'+id).removeClass('active');
  });

  $(document).on('click', '.reviews-tab-content .additional_fields', function(){
    if($(this).hasClass('active')){
      $(this).removeClass('active')
      $('.additional_block').removeClass('active');
    }
    else{
      $(this).addClass('active');
      $('.additional_block').addClass('active');
    }
    // scrollForm($('.reviews-tab-content-form .modalFormReviews'), 1);
  });

  $(document).on('click', '.reviews-tab-content .headerModalForm .modalTabs li', function(){

    if($(this).hasClass('error_logged')){
      $('.reviews-tab-content-form .modalFormReviews').removeClass('active');
      $('.reviews-tab-content-form .modalBackdrop').removeClass('active');
      showErrorMessage($('.notification_labels .reviews_label_74').val());
      return false;
    }

    var tab = $(this).attr('data-tab');
    $('.reviews-tab-content-form .headerModalForm .modalTabs li').removeClass('active');
    $('.reviews-tab-content-form .contentModalForm .formTab').removeClass('active');
    $(this).addClass('active')
    $('.reviews-tab-content-form .contentModalForm .formTab.'+tab).addClass('active');
    scrollForm($('.reviews-tab-content-form .modalFormReviews'), 1);

    if(tab == 'review'){
      $('.reviews-tab-content-form').removeClass('formQuestions');
      $('.reviews-tab-content-form').addClass('formReviews');
      if(!emojioneAreaRiviews){
        $(".reviews-tab-content-form .input_text .customer_review").emojioneArea();
        emojioneAreaRiviews = 1
      }
    }
    else{
      $('.reviews-tab-content-form').removeClass('formReviews')
      $('.reviews-tab-content-form').addClass('formQuestions');
      if(!emojioneAreaQuestions){
        $(".reviews-tab-content-form .input_text .customer_review_question").emojioneArea();
        emojioneAreaQuestions = 1
      }
    }
  });

  $(document).on('click', '.reviews-tab-content .add_new_reply', function(){
    var id = $(this).attr('data-id');
    addNewReply(id)
  });

  $(document).on('click', '.reviews-tab-content .headerModalForm .close_block, .modalBackdrop', function(){
    $('.reviews-tab-content-form .modalBackdrop').removeClass('active');
    $('.reviews-tab-content-form .modalFormReviews').removeClass('active');
    $('.reviews-tab-content-form .formMessageTab').removeClass('active');
  });

  $(document).on('click', '.add_new_review, .empty_dedicated_reviews_page_write_new a', function(){

    if($(this).hasClass('error_logged') && !logged){
      showErrorMessage($('.notification_labels .reviews_label_74').val());
      return false;
    }

    $('.reviews-tab-content.reviews-tab-content-form').remove();
    var modalFormReviews = $('.modal_block_reviews').html();
    $('body').prepend('<div class="reviews-tab-content reviews-tab-content-form formReviews">'+modalFormReviews+'</div>');
    $('.reviews-tab-content-form .modalTabs .tab_review').addClass('active');
    $('.reviews-tab-content-form  .modalTabs .tab_question ').removeClass('active');
    $('.reviews-tab-content-form .contentModalForm .formTab.question').removeClass('active');
    $('.reviews-tab-content-form .contentModalForm .formTab.review').addClass('active');
    $('.reviews-tab-content-form .modalBackdrop').addClass('active');
    $('.reviews-tab-content-form .modalFormReviews').addClass('active');

    $(".reviews-tab-content-form .input_text .customer_review").emojioneArea();
    emojioneAreaRiviews = 1
    scrollForm($('.reviews-tab-content-form  .modalFormReviews'), 1);
  });



  $(document).on('click', '.reviews-tab-content .add-new-review .add-review, .write_review, .mpm_write_review', function(){

    if(($(this).hasClass('error_logged') && !logged) || ($(this).parents('.no_reviews_description ').hasClass('error_logged') && !logged) || ($('.add-new-review .add-review').hasClass('error_logged') && !logged)){
      showErrorMessage($('.notification_labels .reviews_label_74').val());
      return false;
    }

    $('.reviews-tab-content.reviews-tab-content-form').remove();
    var modalFormReviews = $('.modal_block_reviews').html();
    $('body').prepend('<div class="reviews-tab-content reviews-tab-content-form formReviews">'+modalFormReviews+'</div>');

    $('.reviews-tab-content-form .modalTabs .tab_review').addClass('active');
    $('.reviews-tab-content-form .modalTabs .tab_question ').removeClass('active');
    $('.reviews-tab-content-form .contentModalForm .formTab.question').removeClass('active');
    $('.reviews-tab-content-form .contentModalForm .formTab.review').addClass('active');
    $('.reviews-tab-content-form .modalBackdrop').addClass('active');
    $('.reviews-tab-content-form .modalFormReviews').addClass('active');

    $(".reviews-tab-content-form .input_text .customer_review").emojioneArea();
    emojioneAreaRiviews = 1
    scrollForm($('.reviews-tab-content-form  .modalFormReviews'), 1);
  });

  $(document).on('click', '.reviews-tab-content .add-new-question  .add-question, .reviews-tab-content .ask_question, .mpm_ask_question', function(){

    if(($(this).hasClass('error_logged')  && !logged) || ($('.add-new-question .add-question').hasClass('error_logged') && !logged)){
      showErrorMessage($('.notification_labels .reviews_label_74').val());
      return false;
    }

    $('.reviews-tab-content.reviews-tab-content-form').remove();
    var modalFormQuestion = $('.modal_block_reviews').html();
    $('body').prepend('<div class="reviews-tab-content reviews-tab-content-form formQuestions">'+modalFormQuestion+'</div>');

    $('.reviews-tab-content-form .modalTabs .tab_question').addClass('active');
    $('.reviews-tab-content-form .modalTabs .tab_review').removeClass('active');
    $('.reviews-tab-content-form .contentModalForm .formTab.question').addClass('active');
    $('.reviews-tab-content-form .contentModalForm .formTab.review').removeClass('active');
    $('.reviews-tab-content-form .modalBackdrop').addClass('active');
    $('.reviews-tab-content-form .modalFormReviews').addClass('active');

    $(".reviews-tab-content-form .input_text .customer_review_question").emojioneArea();
    emojioneAreaQuestion = 1
    scrollForm($('.reviews-tab-content-form .modalFormReviews'), 1);
  });

  $('body').scroll(function () {
    if($('.reviews-tab-content-form  .modalFormReviews').length>0){
      scrollForm($('.reviews-tab-content-form .modalFormReviews'), 0);
    }
  });


})

function resizeImages() {
  if($( ".reviews-tab-content .images_review .image_list" ).length>0){
    $( ".images_review .image_list" ).each(function( index ) {
      var id = $(this).attr('data-id');
      var height = 0;

      $( ".image_list_"+id+" li" ).each(function( index ) {
        if($(this).outerHeight()>height){
          height = $(this).outerHeight();
        }
      })
      $( ".image_list_"+id+" li" ).css('height', height+'px');
    });
  }

}


function reviewsPagination(type, p, dedicated_reviews_type) {

  if(type == 'pagination'){
    $('.pagination_page_active').val(p);
  }
  else{
    $('.pagination_page_active').val($('.pagination_page_active').val()+','+p);
  }

  paginationPageActive();
  var data = getPaginationData(type, dedicated_reviews_type);

  data['dedicated_reviews_type'] = dedicated_reviews_type;

  var basePath = $('.reviews-block-hidden input[name="basePath"]').val();

  $.ajax({
    url: basePath + 'index.php?rand=' + new Date().getTime(),
    type:     "post",
    dataType: "json",
    data : {
      ajax: true,
      token: "",
      controller: 'AjaxForm',
      fc: 'module',
      module: 'mpm_helpdesc',
      action: 'reviewsPagination',
      data: data,
    },
    beforeSend: function(){
      $('.loader_block_helpdesc').addClass('active');
    },
    success:  function(response) {
      if(response.page){

        if(dedicated_reviews_type){
          $('.dedicated_reviews_list').replaceWith(response.page);
          paginationPageActive();
          $(".dedicated_reviews_list .dedicated_review_main").emojioneReplace();
        }
        else{
          $('.reviews_list_replace').html(response.page);
          paginationPageActive();
          $(".item_reply_content").emojioneReplace();
          $(".review_main_container .base_review").emojioneReplace();
        }

      }
      setTimeout(function () {
        $('.loader_block_helpdesc').removeClass('active');
      }, 100);
    }
  });

}

function paginationPageActive() {

  var page_active =  $('.pagination_page_active').val();

  if(page_active){
    page_active = page_active.split(',');
    $('.reviews_pagination li').removeClass('active');
    $.each(page_active, function( index, value ) {
      $('.reviews_pagination li a[data-p='+value+']').parent().addClass('active');
    });
  }


}

function getPaginationData(type, dedicated_reviews_type) {

  var data = {};
  data['type'] = type;
  data['id_site'] = $('.block_hidden_value .id_site').val();
  data['id_shop'] = $('.reviews-block-hidden input[name=id_shop]').val();
  data['id_lang'] = $('.reviews-block-hidden input[name=id_lang]').val();
  data['isLogged'] = $('.reviews-block-hidden input[name=isLogged]').val();
  data['id_product'] = $('.reviews-block-hidden input[name=id_product]').val();
  data['p'] = $('.pagination_page_active').val();
  data['n'] = $('.pagination_page_count').val();

  if(dedicated_reviews_type){
    data['sort'] = $('.sort_dedicated_reviews li.selected').attr('data-value');
  }
  else{
    data['sort'] = $('.sortByList li.active').attr('data-value');
  }


  return data;
}


function updateLike(id, type, like_val, dislike_val) {

  $.ajax({
    url:      HTTP_BASE_PATH + "api/index/update-like",
    type:     "post",
    dataType: "json",
    data : {
      type : type,
      id : id,
      like_val : like_val,
      dislike_val : dislike_val,
      id_site : $('.block_hidden_value  input[name=id_site]').val(),
      id_product : $('.block_hidden_value  input[name=id_product]').val(),
      id_shop : $('.block_hidden_value  input[name=id_shop]').val(),
    },
    beforeSend: function(){
      // if( !$(".load_products").length ){
      //   $(".shopper_products").after("<div class='load_products'><span></span></div>");
      // }
    },
    success:  function(response) {
      if(response.like || response.dislike){
        $('.item_review_'+id+' .count_like').html(response.like);
        $('.item_review_'+id+' .count_dislike').html(response.dislike);

        document.cookie = "idReviews_"+id+"="+type;

        setCookie("idReviews_"+id, type, 10000);
      }
    }
  });
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function addNewReply(id) {

  var data = formReplyValue(id);

  $.ajax({
    url:      HTTP_BASE_PATH + "api/index/add-reply",
    type:     "post",
    dataType: "json",
    data : data,
    beforeSend: function(){
      $('.loader_block_myprestareviews_reply').addClass('active');
    },
    success:  function(response) {
      $('.loader_block_myprestareviews_reply').removeClass('active');
      if(response.error){
        if(response.focus_field){
          if(response.focus_field == 'notify_reply_gdpr_block'){
            showErrorMessage(response.error);
          }
          else{
            showStoreError(response.focus_field, response.error);
          }
        }
        else{
          showErrorMessage(response.error);
        }
      }
      else if(response.message){
        $('.item_form_reply_'+id+' .form_new_reply')[0].reset();
        showSuccessMessage(response.message);
      }

    }
  });
}


function addNewQuestion() {

  var data = formQuestionValue();

  $.ajax({
    url:      HTTP_BASE_PATH + "api/index/add-question",
    type:     "post",
    dataType: "json",
    processData: false,
    contentType: false,
    data : data,
    beforeSend: function(){
      $('.loader_block_myprestareviews').addClass('active');
    },
    success:  function(response) {
      $('.loader_block_myprestareviews').removeClass('active');
      if(response.error){

        if(response.focus_field){
          if(response.focus_field == 'notify_question_gdpr_block'){
            showMessage(response.error, 'error');
          }
          else if(response.focus_field == 'customer_review_question'){
            showStoreError('emojionearea.customer_review_question', response.error);

          }
          else{
            showStoreError(response.focus_field, response.error);
          }
        }
        else{
          showMessage(response.error, 'error');
        }
      }
      else if(response.message){
        $('.contentModalForm')[0].reset();
        showMessage(response.message, 'success');
      }
    }
  });
}


function addNewReview() {

  var data = formReviewValue();


  $.ajax({
    url:      HTTP_BASE_PATH + "api/index/add-review",
    type:     "post",
    dataType: "json",
    processData: false,
    contentType: false,
    data : data,
    beforeSend: function(){
      $('.loader_block_myprestareviews').addClass('active');
    },
    success:  function(response) {
      $('.loader_block_myprestareviews').removeClass('active');
      if(response.error){
        if(response.focus_field){
          if(response.focus_field == 'notify_reviews_gdpr_block'){
            showMessage(response.error, 'error');
          }
          else if(response.focus_field == 'customer_review'){
            showStoreError('emojionearea.customer_review' , response.error);
          }
          else{
            showStoreError(response.focus_field , response.error);
          }
        }
        else{
          showMessage(response.error, 'error');
        }
      }
      else if(response.message){
        $('.contentModalForm')[0].reset();
        showMessage(response.message, 'success');
      }
    }
  });
}


function showStoreError(focus_field, msg) {

  if($('input[name="'+focus_field+'"]').length>0){
    $('input[name="'+focus_field+'"]').focus();
    $('input[name="'+focus_field+'"]').parent().find('.error_label').html(msg);
    $('input[name="'+focus_field+'"]').parent().addClass('error');
    setTimeout(function () {
      $('input[name="'+focus_field+'"]').parent().removeClass('error');
    }, 2000);
  }

  if($('.'+focus_field).length>0){
    $('.'+focus_field).focus();
    $('.'+focus_field).parent().find('.error_label').html(msg);
    $('.'+focus_field).parent().addClass('error');
    setTimeout(function () {
      $('.'+focus_field).parent().removeClass('error');
    }, 2000);
  }

  if(msg && !focus_field){
    showMessage(msg, 'error');
  }

  if(!msg){
    $('.'+focus_field).addClass('error_field');
    setTimeout(function () {
      $('.'+focus_field).removeClass('error_field');
    }, 2000);
  }


}


function showMessage(msg, type) {
  $('.modalTabs li').removeClass('active');
  $('.formReviewsTab').removeClass('active');
  $('.formQuestionTab').removeClass('active');
  $('.formMessageTab .message_content').html(msg);
  $('.formMessageTab .message_content').removeClass('error');
  $('.formMessageTab .message_content').removeClass('success');
  $('.formMessageTab .message_content').addClass(type);
  $('.formMessageTab').addClass('active');
  scrollForm($('.modalFormReviews'), 1);
}

function formReplyValue(id) {
  var fieldData = '';


  var gdpr = 1;

  if($('.form_new_reply #notify_reply_gdpr_'+id).length>0){
    gdpr = $('.form_new_reply .item_gdpr_'+id+' input[name=notify_reply_gdpr]:checked').val();
  }

  fieldData = fieldData+'id_review='+id+'&';
  fieldData = fieldData+'id_product='+$('.block_hidden_value  input[name=id_product]').val()+'&';
  fieldData = fieldData+'product_link='+$('.block_hidden_value  input[name=product_link]').val()+'&';
  fieldData = fieldData+'product_name='+$('.block_hidden_value  input[name=product_name]').val()+'&';
  fieldData = fieldData+'id_site='+$('.block_hidden_value  input[name=id_site]').val()+'&';
  fieldData = fieldData+'id_shop='+$('.block_hidden_value  input[name=id_shop]').val()+'&';
  fieldData = fieldData+'id_lang='+$('.reviews-block-hidden  input[name=id_lang]').val()+'&';
  fieldData = fieldData+'customer_name='+$('.reviews_list .item_form_reply_'+id+'  input[name=customer_name]').val()+'&';
  fieldData = fieldData+'customer_email='+$('.reviews_list .item_form_reply_'+id+'  input[name=customer_email]').val()+'&';
  fieldData = fieldData+'customer_review='+$('.reviews_list .item_form_reply_'+id+'  textarea[name=customer_review]').val()+'&';
  fieldData = fieldData+'gdpr='+gdpr+'&';

  fieldData = rtrim(fieldData, '&');

  return fieldData;
}

function rtrim(str, chr) {
  var rgxtrim = (!chr) ? new RegExp('\\s+$') : new RegExp(chr+'+$');
  return str.replace(rgxtrim, '');
}

function formReviewValue() {
  var fieldData = new FormData();

  if($('.reviews-tab-content-form #attachment').length>0){
    var ins = document.getElementById('attachment').files.length;
    for (var x = 0; x < ins; x++) {
      fieldData.append("file[]", document.getElementById('attachment').files[x]);
    }
  }

  var customer_advantages = '';
  var customer_disadvantage = '';
  var gdpr = 1;



  if($('.reviews-tab-content-form .modalFormReviews input[name=notify_reviews_gdpr]').length>0){
    gdpr = $('.reviews-tab-content-form .modalFormReviews input[name=notify_reviews_gdpr]:checked').val();
  }

  if($('.reviews-tab-content-form .modalFormReviews input[name=customer_advantages]').length>0){
    customer_advantages = $('.reviews-tab-content-form .modalFormReviews input[name=customer_advantages]').val();
  }

  if($('.reviews-tab-content-form .modalFormReviews input[name=customer_disadvantage]').length>0){
    customer_disadvantage = $('.reviews-tab-content-form .modalFormReviews input[name=customer_disadvantage]').val();
  }

  fieldData.append('bought', $('.reviews-tab-content-form .reviews-block-hidden input[name=bought]').val());
  fieldData.append('id_product', $('.reviews-tab-content-form .block_hidden_value input[name=id_product]').val());
  fieldData.append('product_link', $('.reviews-tab-content-form .block_hidden_value input[name=product_link]').val());
  fieldData.append('product_name', $('.reviews-tab-content-form .block_hidden_value input[name=product_name]').val());
  fieldData.append('id_site', $('.reviews-tab-content-form .block_hidden_value input[name=id_site]').val());
  fieldData.append('id_shop', $('.reviews-tab-content-form .block_hidden_value input[name=id_shop]').val());
  fieldData.append('id_lang', $('.reviews-tab-content-form .reviews-block-hidden input[name=id_lang]').val());

  fieldData.append('customer_name', $('.reviews-tab-content-form .modalFormReviews input[name=customer_name]').val());
  fieldData.append('customer_email', $('.reviews-tab-content-form .modalFormReviews input[name=customer_email]').val());
  fieldData.append('customer_advantages', customer_advantages);
  fieldData.append('customer_disadvantage', customer_disadvantage);

  var review = $(".reviews-tab-content-form  .contentModalForm textarea.customer_review").data("emojioneArea").getText();
  fieldData.append('customer_review', review);

  var rating = $('.reviews-tab-content-form .modalFormReviews .rating_reviews input[name=rating]:checked').val();
  var recommend = $('.reviews-tab-content-form .modalFormReviews input[name=recommend]:checked').val();
  var notify = $('.reviews-tab-content-form .modalFormReviews input[name=notify_reviews]:checked').val();


  fieldData.append('rating', rating);
  fieldData.append('notify', notify);
  fieldData.append('recommend', recommend);
  fieldData.append('gdpr', gdpr);


  var params = getParams(location.href);
  var from_email = 0;
  if(params['from_email']){
    from_email = 1;
  }

  fieldData.append('from_email', from_email);

  return fieldData;
}

function getParams(url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};


function formQuestionValue() {
  var fieldData = new FormData();
  var gdpr = 1;
  if($('.reviews-tab-content-form  #attachment_question').length>0){
    var ins = document.getElementById('attachment_question').files.length;
    for (var x = 0; x < ins; x++) {
      fieldData.append("file[]", document.getElementById('attachment_question').files[x]);
    }
  }
  if($('.reviews-tab-content-form .modalFormReviews input[name=notify_question_gdpr]').length>0){
    gdpr = $('.reviews-tab-content-form  .modalFormReviews input[name=notify_question_gdpr]:checked').val();
  }
  fieldData.append('id_product', $('.reviews-tab-content-form .modalFormReviews input[name=id_product]').val());
  fieldData.append('product_link', $('.reviews-tab-content-form .block_hidden_value input[name=product_link]').val());
  fieldData.append('product_name', $('.reviews-tab-content-form .block_hidden_value input[name=product_name]').val());
  fieldData.append('id_site', $('.reviews-tab-content-form .modalFormReviews input[name=id_site]').val());
  fieldData.append('id_shop', $('.reviews-tab-content-form .modalFormReviews input[name=id_shop]').val());
  fieldData.append('id_lang', $('.reviews-tab-content-form .reviews-block-hidden input[name=id_lang]').val());
  fieldData.append('customer_name', $('.reviews-tab-content-form .modalFormReviews input[name=customer_name_question]').val());
  fieldData.append('customer_email', $('.reviews-tab-content-form .modalFormReviews input[name=customer_email_question]').val());
  fieldData.append('gdpr', gdpr);
  var question = $(".reviews-tab-content-form .contentModalForm textarea.customer_review_question").data("emojioneArea").getText();

  fieldData.append('customer_question',question);

  return fieldData;
}



function scrollForm(el, show) {

  var top = $(document).scrollTop();
  var height_window = $(window).outerHeight();
  var width_window = $(window).outerWidth();
  var height_form = el.outerHeight();
  var width_form = el.outerWidth();
  var margin = (height_window - height_form)/2;
  var margin_left = (width_window - width_form)/2;
  var form_offset = el.offset().top;

  if(show && margin < 11){
    margin = 11;
  }

  if(show){
    el.css('left', margin_left+'px');
  }

  if(margin > 10){
    var margin_top = margin+top;
    el.css('top', margin_top+'px');

  }
  else {
    if (direction >= 0) {

      if( top < form_offset ){
        el.css({top: (top + 10)});
      }
    }
    if (direction < 0) {
      if (top > (height_form + 10 - height_window)) {
        el.css({top: (top - (height_form - height_window + 10))});
      }
    }
  }
}


$(document).ready(function(){

  $(document).on('click', ".notificationsMessageClose2, .notificationsBlockOverlay2", function(){
    hideMessages2();
  });

  $(document).on('click', ".notificationsMessageClose, .notificationsBlockOverlay", function(){
    hideMessages();
  });

});

function showSuccessMessage(msg, autoHide) {
  showMessages(msg, 1, 'successMessageBlock');
  positionMessage($('.notificationsBlockMessage'));
}

function showErrorMessage(msg, autoHide) {
  showMessages(msg, 1, 'errorMessageBlock');
  positionMessage($('.notificationsBlockMessage'));
}

function showSuccessMessage2(msg, autoHide) {
  showMessages2(msg, autoHide, 'successMessageBlock2');
  positionMessage($('.notificationsBlockMessage2'));
}

function showErrorMessage2(msg, autoHide) {
  showMessages2(msg, autoHide, 'errorMessageBlock2');
  positionMessage($('.notificationsBlockMessage2'));
}


function showMessages(msg, autoHide, classBlock) {
  var form = '';
  form += '<div class="notificationsBlock '+classBlock+'">';
  form += '<div class="notificationsBlockOverlay"></div>';
  form += '<div class="notificationsBlockMessage">';
  form += '<div class="notificationsMessageRight">';
  form += '<div class="notificationsMessageTitle">';
  form += '<span class="notificationsSuccess">';
  if($('.notification_labels .reviews_label_72').length>0){
    form += $('.notification_labels .reviews_label_72').val();
  }
  form += '</span>';
  form += '<span class="notificationsError">';
  if($('.notification_labels .reviews_label_73').length>0){
    form += $('.notification_labels .reviews_label_73').val();
  }
  form += '</span>';
  form += '</div>';
  form += '<div class="notificationsMessage">';
  form += msg;
  form += '</div>';
  form += '</div>';
  form += '</div>';
  form += '</div>';
  $('body').append(form);
  $( ".notificationsBlock" ).fadeIn(250);

  if(autoHide){
    setTimeout(function () {
      hideMessages();
    }, 4000);
  }

}


function showMessages2(msg, autoHide, classBlock) {
  var form = '';
  form += '<div class="notificationsBlock2 '+classBlock+'">';
  form += '<div class="notificationsBlockOverlay2"></div>';
  form += '<div class="notificationsBlockMessage2">';
  form += '<div class="notificationsMessageLeft2">';
  form += '<div class="notificationsMessageLeftIcon2">';
  form += '<i class="mpr-close material-icons-error"></i>';
  form += '<i class="mpr-check  material-icons-success"></i>';
  form += '</div>';
  form += '</div>';
  form += '<div class="notificationsMessageRight2">';
  form += '<div class="notificationsMessageTitle2">';
  form += '<span class="notificationsSuccess2">';
  form += $('.notification_labels .reviews_label_72').val();
  form += '</span>';
  form += '<span class="notificationsError2">';
  form += $('.notification_labels .reviews_label_73').val();
  form += '</span>';
  form += '</div>';
  form += '<div class="notificationsMessage2">';
  form += msg;
  form += '</div>';
  form += '</div>';
  form += '<div class="clear_both"></div>';
  form += '<div class="notificationsMessageClose2">Close window</div>';
  form += '</div>';
  form += '</div>';
  $('body').append(form);
  $( ".notificationsBlock2" ).fadeIn(250);

  if(autoHide){
    setTimeout(function () {
      hideMessages2();
    }, 3000);
  }

}

function positionMessage(el) {
  setTimeout(function () {
    var top = $(document).scrollTop();
    var height_window = $(window).outerHeight();
    var width_window = $(window).outerWidth();
    var height_form = el.outerHeight();
    var width_form = el.outerWidth();
    var margin = (height_window - height_form)/2;
    var margin_left = (width_window - width_form)/2;

    if(margin < 10){
      var margin_top = top + 10;
    }
    else{
      var margin_top = margin + top;
    }

    el.css('top', margin_top+'px');
    el.css('left', margin_left+'px');
  }, 50);
}


function replaceStars(item) {
  $(".star_block .rating_reviews label").removeClass('checked');
  for (var i = 1; i <= item; i++) {
    $('.item_full_'+i).addClass('checked');
  }
}

function hideMessages() {
  $( ".notificationsBlock " ).fadeOut(250);
  setTimeout(function () {
    $( ".notificationsBlock " ).remove();
  }, 250);
}

function hideMessages2() {
  $( ".notificationsBlock2" ).fadeOut(250);
  setTimeout(function () {
    $( ".notificationsBlock2" ).remove();
  }, 250);
}

function scrollFormReviews(el, show) {

  var top = $(document).scrollTop();
  var height_window = $(window).outerHeight();
  var height_form = el.outerHeight();
  var margin = (height_window - height_form)/2;
  var form_offset = el.offset().top;

  if(show && margin < 11){
    margin = 11;
  }

  if(margin > 10){
    var margin_top = margin+top;
    el.css('top', margin_top+'px');
  }
  else {
    if (direction >= 0) {

      if( top < form_offset ){
        el.css({top: (top + 10)});
      }
    }
    if (direction < 0) {
      if (top > (height_form + 10 - height_window)) {
        el.css({top: (top - (height_form - height_window + 10))});
      }
    }
  }
}


function sendNewQuestion(id) {

  var fieldData = new FormData();

  var ins = document.getElementById('attachment_new_question').files.length;
  for (var x = 0; x < ins; x++) {
    fieldData.append("file[]", document.getElementById('attachment_new_question').files[x]);
  }

  fieldData.append('id_question', id);
  fieldData.append('isLogged', $('.questions-block-hidden input[name=isLogged]').val());
  fieldData.append('id_shop', $('.questions-block-hidden input[name=id_shop]').val());
  fieldData.append('id_lang', $('.questions-block-hidden input[name=id_lang]').val());
  fieldData.append('id_site', $('.questions_tab_content input[name=id_site]').val());


  var message = $("textarea.customer_new_question").data("emojioneArea").getText();

  fieldData.append('message', message);


  $.ajax({
    url:      HTTP_BASE_PATH + "api/question/send-new-question",
    type:     "post",
    dataType: "json",
    processData: false,
    contentType: false,
    data : fieldData,
    beforeSend: function(){
      $('.loader_block_helpdesc').addClass('active');
    },
    success:  function(response) {
      $('.loader_block_helpdesc').removeClass('active');
      if(response.error){
        if(response.focus_field){
          showStoreError('emojionearea.customer_new_question', response.error);
        }
        else{
          showErrorMessage(response.error);
        }
      }
      else if(response.message){
        $('.questions_list').append(response.message);
        $(".item_message_"+response.id+" .question_message").emojioneReplace();
        $(".new_question_message .emojionearea-editor").html('');
        $('.add_new_question')[0].reset();
      }
    }
  });
}





