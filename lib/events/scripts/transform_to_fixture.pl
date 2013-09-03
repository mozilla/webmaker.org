#!/usr/bin/env perl
use Modern::Perl;
use JSON;
use JE;

# Usage:
#   curl https://webmaker.org/events.json | perl scripts/transform_to_fixture.pl > fixtures/initial_data.json

sub js_eval {
    # setup toISOString polyfill
    JE->new->eval(q|Date.prototype.toISOString = function(a){a=this;return(1e3-~a.getUTCMonth()*10+a.toUTCString()+1e3+a/1).replace(/1(..).*?(\d\d)\D+(\d+).(\S+).*(...)/,'$3-$1-$2T$4.$5Z')};|.join(';', @_)).''
}

my $import = decode_json <>;
print JSON->new->utf8(1)->pretty(1)->encode([ map {
    my $data = $_;
    for (glob '{begin,end}Date') {
        undef $$data{$_}, next unless $$data{$_};
        $$data{$_} = js_eval "new Date('$$data{$_}').toISOString()"
    }
    for (glob '{begin,end}Time') {
        undef $$data{$_}, next unless $$data{$_};
        $$data{$_} =~ /^(\d+):(\d+)([ap]m)$/;
        $$data{$_} = js_eval "new Date(
            0, 0, 0, $1 % 12 + ('$3' === 'pm') * 12, $2
        ).toISOString()"
    }
    { model => "Event", data  => $data }
} @{$$import{events}} ])
