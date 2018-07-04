#!/bin/bash

if [ $TRAVIS_BRANCH == 'master']; then
    scp -r $scp_dest ./_site
fi