High Level To Do List
=======

## Expanded Error Handling and Reporting

There's a lot of places where things might fail right now that are potentially poorly handled.  For instance,
if protractor doesn't detect any tests to run.

These situations should be identified and handled cleanly.

## Reduce Noise and Provide Cleaner Reporting

Right now all of the output of sauce-connect, webdriver, etc is simply piped through to stdout and
stderr.  Long-term it'd be ideal if this could be captured and cleaner, more legible output
could be provided.

## Remove implicit use of console.log

It's a little invasive.  We should provide configurable logging.
