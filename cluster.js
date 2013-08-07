var habitat = require( 'habitat' );
habitat.load();

var env = new habitat(),
    cluster = require( 'cluster' ),
    shouldRestart = env.get( 'RESTART' ) == 1,
    forks = ( env.get( 'FORKS' )|0 ) || require( 'os' ).cpus().length;

// Only (re)fork if we're a) starting up; or b) had a worker get to
// 'listening'. Don't fork in an endless loop if the process is bad.
function fork() {
  console.log( 'Starting server worker...' );
  cluster.fork().on( 'listening', function() {
    console.log( 'Server worker started.' );
  });
}

cluster.setupMaster({ exec: 'app.js' });
cluster.on( 'exit', function( worker, code, signal ) {
  console.error( 'Server worker %s exited.', worker.id );

  // Restart server worker only if we've been configured that way.
  if ( shouldRestart ) {
    fork();
  }

  // If there are no more workers running, shut down cluster process.
  if ( !Object.keys( cluster.workers ).length ) {
    console.error( 'No more server workers running, shutting down.' );
    process.exit( 1 );
  }
});

while( forks-- ) {
  fork();
}
