---
layout: './pages/layouts/post.html'
title: "Setup a Raspberry Pi"
excerpt: "Ready to talk."
published: 2018-03-01
uri: '/blog/2018/setup-raspberrypi.html'
tags: ['experimenting']
---
# I want a Raspberry Pi ready to talk to other machines

Create a Rasbperian Pi image. Raspbian Stretch Lite

```bash
cd /Volumes/boot
touch ssh
```

```bash
vi wpa_supplicant.conf
```

Automatically connect to Wifi network

```bash
country=US
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
    ssid="testing"
    psk="testingPassword"
}
```

Turn it on and it should be available via `raspberrypi.local`.

```bash
ssh pi@raspberrypi.local
# update your password with passwd
passwd
# enable ssh
sudo systemctl enable ssh
sudo systemctl start ssh
sudo reboot
```

Do a few things at a time to make sure they work :)

```bash
sudo apt update
sudo apt full-upgrade -y
```

```bash
# install the latest version. 1.2.2 is the latest as of 9/3/2018
curl -o /tmp/consul_1.2.2_linux_arm.zip -L https://releases.hashicorp.com/consul/1.2.2/consul_1.2.2_linux_arm.zip
unzip /tmp/consul_1.2.2_linux_arm.zip
# put it somewhere staff can execute without sudo
sudo mv consul /usr/local/bin/
```

```bash
# create the data-dir
mkdir /var/lib/consul/
# create config-dir
mkdir /etc/consul.d/
mkdir /var/consul
consul agent -config-dir=/etc/consul.d
```

I'm tired of having to ssh and type my password.

```bash
# if you need to generate a public/private key pair
ssh-keygen -t rsa

```

```bash
ssh pi@raspberrypi.local mkdir -p .ssh
cat .ssh/id_rsa.pub | ssh pi@raspberrypi.local 'cat >> .ssh/authorized_keys'
```
