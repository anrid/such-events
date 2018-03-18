# Find all lines containing regexp and group and count occurrences.
grep -o -E '"project_permissions":\d+' /tmp/tasks-with-metadata-json.txt | sort | uniq -c

# Export tasks since 2018-01-01
node dist/reports/import-into-es/ --export --tasks --limit 50000 --from 2018-01-01

# Export related task metadata.
node dist/reports/import-into-es/ --export --metadata

# Join metadata.
node dist/reports/import-into-es/ --export --join

# Import tasks into ES.
node dist/reports/import-into-es/ --import --tasks

# Search !
node dist/reports/import-into-es/ --search --tasks \
  --fields title,created,space_id --sort created:desc --aggs --query 'project_title:feed*'

node dist/reports/import-into-es/ --search --tasks \
  --fields title,project_title,created,space_id --sort created:desc --aggs --query 'space_id:5a8a5cd38a9afe110a331303' --size 10

node dist/reports/import-into-es/ --search --tasks \
  --sort created:desc --aggs --size 5 --query '(space_id:5977c6c1b85ac8355d63695e) AND (title:business)' \
  --debug --fields title,space_id --highlight title

node dist/reports/import-into-es/ --search --tasks \
  --sort created:desc --aggs --size 5 --query '(title:"good job")' \
  --debug --fields title,space_id --highlight title
