FROM debian:buster AS base

RUN groupadd --force -g 1000 node
RUN useradd -ms /bin/bash --no-user-group -g 1000 -u 1000 node

RUN apt-get update
RUN apt-get install -y sudo wget cmake swig git virtualenv python-dev libffi-dev build-essential libncurses-dev libusb-dev avrdude gcc-avr binutils-avr avr-libc dfu-util libnewlib-arm-none-eabi gcc-arm-none-eabi binutils-arm-none-eabi libusb-1.0
RUN mkdir /src
WORKDIR /src
RUN wget http://download.savannah.nongnu.org/releases/simulavr/libsim_1.1.0_amd64.deb
RUN apt install /src/libsim_1.1.0_amd64.deb

#prebuild files for simulavr, not needed currently, because we just build the python lib later
#RUN wget http://download.savannah.nongnu.org/releases/simulavr/simulavr_1.1.0_amd64.deb
#RUN apt install /src/simulavr_1.1.0_amd64.deb
#RUN wget http://download.savannah.nongnu.org/releases/simulavr/python3-simulavr_1.1.0_amd64.deb
#RUN apt install /src/python3-simulavr_1.1.0_amd64.deb

RUN cat /etc/passwd

RUN echo 'node ALL=(ALL:ALL) NOPASSWD: ALL' > /etc/sudoers.d/node && \
    chown node:node -R ./
#if systemd is installed, we need to backup the current systemctl command
#RUN mv /bin/systemctl /bin/systemctl.bak
RUN ln -s /bin/true /bin/systemctl

USER node

WORKDIR /home/node
RUN git clone https://github.com/KevinOConnor/klipper
WORKDIR /home/node/klipper
COPY api/simulavr.config /home/node/klipper/.config
RUN make
RUN cp /home/node/klipper/out/klipper.elf /home/node/klipper/simulavr.elf
RUN rm /home/node/klipper/.config
COPY api/linux.config /home/node/klipper/.config
RUN make clean
RUN make
RUN chmod +x /home/node/klipper/scripts/install-debian.sh
RUN /home/node/klipper/scripts/install-debian.sh

WORKDIR /home/node
RUN git clone https://github.com/Arksine/moonraker
WORKDIR /home/node/moonraker
RUN sed -E 's/check_klipper\(\)/check_klipper() { return 0; }\nold()/' /home/node/moonraker/scripts/install-moonraker.sh > /home/node/moonraker/scripts/install-moonraker2.sh
RUN chmod +x /home/node/moonraker/scripts/install-moonraker2.sh
RUN /home/node/moonraker/scripts/install-moonraker2.sh

RUN sudo rm -f /bin/systemctl
#restore backed up systemctl command
#RUN sudo mv /bin/systemctl.bak /bin/systemctl

WORKDIR /home/node/
RUN git clone https://git.savannah.nongnu.org/git/simulavr.git
WORKDIR /home/node/simulavr
RUN make python
RUN make build

USER root

COPY api/run-api /usr/local/bin/run-api
RUN chmod +x /usr/local/bin/run-api

USER node

ENTRYPOINT ["run-api"]
