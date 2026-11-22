# Dessine l'icône Soleil doux en PNG, sans bibliothèque : un soleil avec son halo sur fond crème.
# Usage : python3 outils/icone.py .   (depuis appli/ ; une dizaine de secondes)
import sys, zlib, struct
def hexa(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
FOND, HALO, SOLEIL = hexa("#FFF4DC"), hexa("#F9DA8C"), hexa("#F2B630")
def png(chemin, taille, r_soleil, r_halo, ss=4):
    c = taille / 2
    lignes = []
    for y in range(taille):
        ligne = bytearray([0])
        for x in range(taille):
            acc = [0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    px, py = x + (sx + .5) / ss, y + (sy + .5) / ss
                    d = ((px - c) ** 2 + (py - c) ** 2) ** .5 / taille
                    col = SOLEIL if d <= r_soleil else HALO if d <= r_halo else FOND
                    for i in range(3): acc[i] += col[i]
            ligne += bytes(round(a / ss / ss) for a in acc)
        lignes.append(bytes(ligne))
    def bloc(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    with open(chemin, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", taille, taille, 8, 2, 0, 0, 0))
                + bloc(b"IDAT", zlib.compress(b"".join(lignes), 9)) + bloc(b"IEND", b""))
dossier = sys.argv[1]
png(f"{dossier}/icone-192.png", 192, .27, .36)
png(f"{dossier}/icone-512.png", 512, .27, .36)
png(f"{dossier}/icone-masquable-512.png", 512, .20, .27)  # plus petit : Android découpe un rond au centre
