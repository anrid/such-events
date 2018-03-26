#/bin/bash
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd $dir/../../
node dist/services/api-gateway/ --id api-gateway-1 --port 10000 &
node dist/services/user/ --id user-service-1 &
node dist/services/notification/ --id notification-service-1 &
node dist/services/echo/ --id echo-service-1 &
wait
