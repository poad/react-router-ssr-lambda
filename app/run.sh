#!/bin/bash

[ ! -d '/tmp/cache' ] && mkdir -p /tmp/cache

HOSTNAME=0.0.0.0 HOME=/tmp exec npm start