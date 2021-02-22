FROM node:buster AS base

RUN apt-get update
RUN apt-get install -y sudo cmake swig git virtualenv python-dev libffi-dev build-essential libncurses-dev libusb-dev avrdude gcc-avr binutils-avr avr-libc dfu-util libnewlib-arm-none-eabi gcc-arm-none-eabi binutils-arm-none-eabi libusb-1.0
RUN mkdir /src
WORKDIR /src
RUN wget http://download.savannah.nongnu.org/releases/simulavr/libsim_1.1.0_amd64.deb
RUN apt install /src/libsim_1.1.0_amd64.deb
#RUN wget http://download.savannah.nongnu.org/releases/simulavr/simulavr_1.1.0_amd64.deb
#RUN apt install /src/simulavr_1.1.0_amd64.deb
#RUN wget http://download.savannah.nongnu.org/releases/simulavr/python3-simulavr_1.1.0_amd64.deb
#RUN apt install /src/python3-simulavr_1.1.0_amd64.deb

COPY start-container /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-container
RUN echo 'node ALL=(ALL:ALL) NOPASSWD: ALL' > /etc/sudoers.d/node && \
    chown node:node -R ./
RUN ln -s /bin/true /bin/systemctl
USER node
WORKDIR /home/node
RUN git clone https://github.com/Arksine/moonraker
WORKDIR /home/node/moonraker
RUN sed -E 's/check_klipper\(\)/check_klipper() { return 0; }\nold()/' /home/node/moonraker/scripts/install-moonraker.sh > /home/node/moonraker/scripts/install-moonraker2.sh
RUN chmod +x /home/node/moonraker/scripts/install-moonraker2.sh
RUN /home/node/moonraker/scripts/install-moonraker2.sh
WORKDIR /home/node
RUN git clone https://github.com/KevinOConnor/klipper
WORKDIR /home/node/klipper
COPY simulavr.config /home/node/klipper/.config
RUN make
RUN cp /home/node/klipper/out/klipper.elf /home/node/klipper/simulavr.elf
RUN rm /home/node/klipper/.config
COPY linux.config /home/node/klipper/.config
RUN make clean
RUN make

WORKDIR /home/node/
RUN git clone https://git.savannah.nongnu.org/git/simulavr.git
WORKDIR /home/node/simulavr
RUN make python
RUN make build

#RUN groupadd --force -g 1000 pi
#RUN useradd -ms /bin/bash --no-user-group -g 1000 -u 1000 pi


RUN chmod +x /home/node/klipper/scripts/install-debian.sh
RUN /home/node/klipper/scripts/install-debian.sh
RUN sudo rm -f /bin/systemctl

FROM base

#RUN mkdir /home/node/printer_config
#RUN mkdir /home/node/gcode


EXPOSE 8080


#COPY config/printer.cfg /home/node/printer_config/printer.cfg
#COPY config/moonraker.conf /home/node/printer_config/moonraker.conf

#RUN sudo chown node:node -hR /home/node/printer_config
#RUN sudo chown node:node -hR /home/node/gcode
#RUN sudo chown node:node -hR /tmp/logs

WORKDIR /home/node/mainsail

ENTRYPOINT ["start-container"]
