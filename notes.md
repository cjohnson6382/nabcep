
<!--inotify watches-->
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

<!--remove sensitive files that were accidentally committed to a github repo-->
https://help.github.com/articles/removing-sensitive-data-from-a-repository/