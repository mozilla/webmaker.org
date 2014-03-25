'use strict';

angular
  .module('exploreApp.services', [])
  .constant('CONFIG', window.angularConfig)
  .constant('SITE', {
    kits: {
      'weblit-Navigation': [
        {
          title: 'Firefox is Free - a lesson on web browsers',
          description: 'An introduction to the structure of URLs and finding resources on the well',
          url: 'https://mozilla.makes.org/thimble/firefox-is-free-learn-about-your-web-browser',
          author: 'mozilla'
        }
      ],
      'weblit-WebMechanics': [
        {
          title: 'Xray Goggles teaching kit',
          description: 'Help people learn basic concepts of HTML, CSS and the Open Web by through tinkering and remixing real web pages',
          url: 'https://mozteach.makes.org/thimble/xray-goggles-teaching-kit',
          author: 'mozteach'
        },
        {
          title: 'Ways of the Web teaching kit',
          description: '',
          url: 'https://mozteach.makes.org/thimble/ways-of-the-web-teaching-kit',
          author: 'mozteach'
        }
      ],
      'weblit-Search': [
        {
          title: 'SEO Battle',
          description: '',
          url: 'https://mousemeredith.makes.org/thimble/seo-battle',
          author: 'Mouse'
        },
        {
          title: 'Cultural Heritage Remix / Wonders of the Web',
          description: '',
          url: 'https://mozteach.makes.org/thimble/remixathon-cultural-heritage',
          author: 'mozteach'
        },
        {
          title: 'Google Search Education',
          description: '',
          url: 'http://www.google.co.uk/insidesearch/searcheducation/',
          author: ''
        },
        {
          title: 'Upping Your Image Quotient',
          description: '',
          url: 'http://cogdog.wikispaces.com/Upping+Your+Image+Q',
          author: 'Adam Levine (cogdog)'
        }
      ],
      'weblit-Credibility': [
        {
          title: 'Network Literacy',
          description: '',
          url: 'http://www.rheingold.com/university/mini-courses/',
          author: 'Rheingold University'
        },
        {
          title: 'Teaching Credibility in the Age of the Internet Hoax',
          description: '',
          url: 'http://www.commonsensemedia.org/educators/blog/teaching-credibility-in-the-age-of-the-internet-hoax-or-how-not-to-be-an-april-fool',
          author: 'Common Sense Media'
        }
      ],
      'weblit-Security': [
        {
          title: 'Privacy and Security kit',
          description: '',
          url: 'https://laura.makes.org/thimble/privacy-and-security-teaching-kit',
          author: 'laura'
        },
        {
          title: 'Tactical Technology Collective\'s Security in a Box',
          description: '',
          url: 'https://securityinabox.org/en/chapter-1',
          author: 'Tactical Technology Collective'
        },
        {
          title: 'Secure Browsing with Firefox Addons',
          description: '',
          url: 'https://securityinabox.org/en/firefox_main',
          author: 'Tactical Technology Collective'
        },
        {
          title: 'Facebook Security Guide',
          description: '',
          url: 'https://securityinabox.org/en/facebook_main ',
          author: 'Facebook'
        }
      ],
      'weblit-Composing': [
        {
          title: 'Markup Mixer',
          description: '',
          link: 'https://thomaspark.makes.org/thimble/markup-mixer',
          author: 'Thomas Park/Marc Lesser'
        },
        {
          title: 'How to Make an Animated Music Video',
          description: '',
          link: 'https://popcorn.webmaker.org/editor/60433/remix',
          author: 'Max Capacity'
        },
        {
          title: 'Making Stop Motion Movies',
          description: '',
          link: 'https://nwp.makes.org/thimble/making-stop-motion-movies',
          author: 'NWP'
        },
        {
          title: 'Online Storytelling Teaching Kit',
          description: '',
          link: 'https://mozteach.makes.org/thimble/online-storytelling-teaching-kit ',
          author: 'mozteach'
        },
        {
          title: 'How to Use Thimble',
          description: '',
          link: 'https://mozteach.makes.org/thimble/thimble-teaching-kit',
          author: ''
        },
        {
          title: 'Coding With the NY Times',
          description: '',
          link: 'https://nwp.makes.org/thimble/coding-with-the-new-york-times',
          author: 'NWP'
        },
        {
          title: 'ScriptED Lesson on HTML/CSS',
          description: '',
          link: 'https://github.com/ScriptEdcurriculum/curriculum/tree/master/lessons/02-05_html_css',
          author: ''
        },
        {
          title: 'HTML Challenges',
          description: '',
          link: 'https://en.wikiversity.org/wiki/Web_Design/HTML_Challenges',
          author: ''
        }
      ],
      'weblit-Remix': [
        {
          title: 'Revolutions in Media',
          description: '',
          link: 'https://mozteach.makes.org/thimble/revolutions-in-media-teaching-kit',
          author: 'mozteach'
        },
        {
          title: 'Make a Meme Hacktivity',
          description: '',
          link: 'https://ccantrill.makes.org/thimble/make-a-meme-hacktivity',
          author: 'Christina Cantrill '
        },
        {
          title: 'Cultural Heritage Remixjam',
          description: '',
          link: 'https://keyboardkat.makes.org/thimble/cultural-remixjam',
          author: 'keyboardkat '
        },
        {
          title: 'Busting Media Stereotypes',
          description: '',
          link: 'https://techkim.makes.org/thimble/busting-media-stereotypes',
          author: 'techkim'
        },
        {
          title: 'Digital Remix Portfolio by Girls Write Now',
          description: '',
          link: 'http://hivenyc.org/portfolio/digital-remix-portfolio/',
          author: 'HiveNYC'
        }
      ],
      'weblit-DesignAccessibility': [
        {
          title: 'Designing for the Web: Planning a Page ',
          description: '',
          link: 'https://mozteach.makes.org/thimble/designing-for-the-web-planning',
          author: ''
        },
        {
          title: 'A Beginner\'s Guide to Game-Making',
          description: '',
          link: 'https://mozteach.makes.org/thimble/a-beginners-guide-to-game-making',
          author: ''
        },
        {
          title: 'Designing for the Web: Images',
          description: '',
          link: 'https://mozteach.makes.org/thimble/designing-for-the-web-images',
          author: ''
        },
        {
          title: 'Designing for the Web: Design',
          description: '',
          link: 'https://mozteach.makes.org/thimble/designing-for-the-web-design',
          author: ''
        },
        {
          title: 'Making your own "about me" page - web fonts kit, part 1',
          description: '',
          link: 'https://fourtonfish.makes.org/thimble/make-your-own-about-me-page-part-i-introduction-to-web-fonts',
          author: ''
        },
        {
          title: 'How to report stories',
          description: '',
          link: 'https://radiorookies.makes.org/thimble/diy-toolkit-how-to-report-your-own-story',
          author: 'Radio Rookies'
        },
        {
          title: 'Getting started with CSS',
          description: '',
          link: 'https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started',
          author: 'MDN'
        },
        {
          title: 'CSS Diners',
          description: '',
          link: 'http://flukeout.github.io/',
          author: 'Flukeout'
        },
        {
          title: 'Fangs: The Screen Reader Emulator for Accessibility ',
          description: '',
          link: 'http://www.standards-schmandards.com/projects/fangs/',
          author: ''
        }
      ],
      'weblit-CodingScripting': [
        {
          title: 'Minecraft: A Flavor of Java',
          description: '',
          link: 'https://epik.makes.org/thimble/minecraft-a-flavor-of-java-epik ',
          author: 'EPIK/Doreen'
        },
        {
          title: 'Variables and Math in Programming',
          description: '',
          link: 'https://github.com/ScriptEdcurriculum/curriculum/blob/master/lessons/08-10_tip-calculator/TeachersNotes.md',
          author: 'ScriptED'
        },
        {
          title: 'Computer Programming',
          description: '',
          link: 'https://www.khanacademy.org/cs',
          author: 'Khan Academy'
        },
        {
          title: 'Intro to Javascript',
          description: '',
          link: 'https://docs.google.com/presentation/d/1CAMz_T9qWWL6GSNx70ZtxwLm-AAN0sBgPaQMDtJ3ZD0/edit#slide=id.p',
          author: 'ScriptED'
        },
        {
          title: 'Code Avengers',
          description: '',
          link: 'http://www.codeavengers.com/javascript/9#1.1',
          author: ''
        },
        {
          title: 'Code Maven',
          description: '',
          link: 'http://www.crunchzilla.com/code-maven',
          author: ''
        },
        {
          title: 'Minicade',
          description: '',
          link: 'http://minica.de/',
          author: ''
        }
      ],
      'weblit-Infrastructure': [
        {
          title: 'Extract tables from PDF files with Tabula',
          description: '',
          link: 'https://manuelaristaran.makes.org/thimble/extract-tables-from-pdf-files-with-tabula',
          author: ''
        },
        {
          title: 'Intro to Github and Version Control lesson',
          description: '',
          link: 'https://github.com/ScriptEdcurriculum/curriculum/blob/master/lessons/06_Intro_to_version_control/TeachersNotes.md ',
          author: 'ScriptED'
        }
      ],
      'weblit-Sharing': [],
      'weblit-Collaborating': [
        {
          title: 'Together.js',
          description: '',
          link: 'https://togetherjs.com',
          author: 'Mozilla'
        },
        {
          title: 'DIY Radio Rookies Toolkit',
          description: 'Tips and Resources to Learn How to Produce Your Own Story',
          link: 'http://www.wnyc.org/story/diy-radio-rookies-toolkit',
          author: ''
        }
      ],
      'weblit-Community': [
        {
          title: 'Make. Hack. Play.',
          description: 'A teaching kit on collaborative practices for NWP',
          link: 'https://laura.makes.org/thimble/agenda-for-make-hack-play-at-nwpam',
          author: 'Laura'
        },
        {
          title: 'Girls in Tech teaching kit',
          description: '',
          link: 'https://stephguthrie.makes.org/thimble/girls-in-tech-teaching-kit',
          author: 'Steph Guthrie'
        },
        {
          title: 'Train the Trainer India: Teaching Kit',
          description: '',
          link: 'https://michelle.makes.org/thimble/train-the-trainer-india-teaching-kit',
          author: ''
        },
        {
          title: 'TeachTheWeb MOOC - Peers working in the Open',
          description: '',
          link: 'http://hivenyc.org/teachtheweb/week-6-peers-working-in-the-open',
          author: ''
        }
      ],
      'weblit-Privacy': [
        {
          title: 'Evil Twin Activity',
          description: '',
          link: 'https://mozteach.makes.org/thimble/evil-twin-the-opposite-of-me',
          author: ''
        },
        {
          title: 'XRay Goggles Gallery Walk',
          description: '',
          link: 'https://patrickwade.makes.org/thimble/xray-goggles-gallery-walk-',
          author: ''
        },
        {
          title: 'TOSBack: The Terms of Service Tracker by EFF',
          description: '',
          link: 'https://tosback.org',
          author: ''
        },
        {
          title: 'Our Privacy Matters!',
          description: '',
          link: 'https://patrickwade.makes.org/thimble/privacy-and-remix-workshop-teaching-kit',
          author: 'Patrick Wade'
        },
        {
          title: 'Privacy and Security teaching kit ',
          description: '',
          link: 'https://laura.makes.org/thimble/privacy-and-security-teaching-kit',
          author: ''
        },
        {
          title: 'How to make a gif-remix for Data Privacy Day',
          description: '',
          link: 'https://popcorn.webmaker.org/editor/65799/remix',
          author: ''
        },
        {
          title: 'Me and My Shadow',
          description: '',
          link: 'https://myshadow.org/shadow-tracers-kit',
          author: ''
        },
        {
          title: 'Install HTTPS Everywhere Firefox Add-on',
          description: '',
          link: 'https://www.eff.org/https-everywhere',
          author: ''
        },
        {
          title: 'PRISM-BREAK',
          description: '',
          link: 'https://prism-break.org/en',
          author: ''
        }
      ],
      'weblit-OpenPractices': [
        {
          title: 'Open Data Day Activity',
          description: '',
          link: 'https://tiptoes.makes.org/thimble/open-data-day',
          author: 'Emma Irwin'
        },
        {
          title: 'The Open Webville Disco',
          description: '',
          link: 'https://thimble.webmaker.org/project/5483/remix',
          author: ''
        },
        {
          title: 'Remix-a-thon / Save the Open Web',
          description: '',
          link: 'https://mozteach.makes.org/thimble/remixathon-save-the-open-web',
          author: ''
        },
        {
          title: 'P2PU & Creative Commons School of Open',
          description: '',
          link: 'https://p2pu.org/en/schools/school-of-open/',
          author: 'P2PU'
        },
        {
          title: 'Get Creative Commons Savvy',
          description: '',
          link: 'https://p2pu.org/en/groups/get-cc-savvy/',
          author: 'P2PU'
        }
      ]
    },
    mentors: [
      {
        name: 'Brett Gaylor',
        avatar: '/img/explore/brett.jpg',
        title: 'Director of Webmaker, Filmmaker',
        handle: '@brett'
      },
      {
        name: 'Laura Hilliger',
        avatar: '/img/explore/laura.jpg',
        title: 'Curriculum Lead, Webmaker',
        handle: '@epilepticrabbit'
      },
      {
        name: 'Gavin Suntop',
        avatar: '/img/explore/gvn.jpg',
        gif: 'https://wmprofile-service-production.s3.amazonaws.com/gifs/ZAGFs14aDMiCRhICFSKqF7ft.gif',
        title: 'Code dude',
        handle: '@gvn'
      }
    ]
  })
  .filter('decodeURI', function() {
    return function (input) {
      return decodeURIComponent(input);
    };
  })
  .factory('weblit', [
    '$window',
    function ($window) {
      var weblit = new $window.WebLiteracyClient();
      return weblit;
    }
  ])
  .factory('makeapi', ['$q',
    function($q) {

      var makeapi = new Make({
        apiURL: 'https://makeapi.webmaker.org'
      });

      return {
        makeapi: makeapi,
        tags: function(tags, callback) {
          var deferred = $q.defer();
          makeapi
            .sortByField('likes')
            .limit(4)
            .find({
              tags: [{tags: tags}],
              orderBy: 'likes'
            })
            .then(function(err, makes) {
               if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(makes);
              }
            });
          return deferred.promise;
        }
      };

    }
  ]);
