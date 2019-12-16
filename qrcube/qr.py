import base64
import os
import click
from math import floor
import qrcode


@click.command()
@click.argument('filename')
def process(filename):
    with open(filename, "rb") as vid_file:
        encoded_base64_vid = base64.b64encode(vid_file.read())
        encoded_base64_vid_length = len(encoded_base64_vid)
        steps = 2900

        extra_steps = encoded_base64_vid_length % steps
        iterative_loop = floor(encoded_base64_vid_length / steps) + 1

        start = 0
        end = steps
        for i in range(iterative_loop):
            slicing = slice(start, end, 1)

            slice_string = encoded_base64_vid[slicing].decode("utf-8")
            if i == iterative_loop - 1:
                extra_string = 'x' * (steps - extra_steps - 1)
                inserted_string = '%s %s' % (slice_string, extra_string)
                qr_string_for_pic = '{"%s": "%s"}' % (i+1, inserted_string)
            else:
                qr_string_for_pic = '{"%s": "%s"}' % (i+1, slice_string)

            if not os.path.exists('output_text'):
                os.makedirs('output_text')

            vid_name = 'output_text/vid%s.txt' % (i+1)

            with open(vid_name, 'w') as f:
                f.write(qr_string_for_pic)
                f.close()

            qr = qrcode.QRCode(
                version=None,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )

            qr.add_data(qr_string_for_pic)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            if not os.path.exists('output_qr_code'):
                os.makedirs('output_qr_code')

            image_name = 'output_qr_code/qr_code_%s.png' % (i + 1)
            img.save(image_name)

            start = start + steps
            if i == iterative_loop - 2:
                end = end + extra_steps
            else:
                end = end + steps

        click.echo("done!")
        vid_file.close()


if __name__ == '__main__':
    process()
