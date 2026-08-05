#!/usr/bin/env python3
"""Download ALL item images from Day R wiki - handles both Title Case and sentence case, WebP and PNG."""
import json, os, urllib.request, concurrent.futures, io
from PIL import Image

ITEMS_DIR = '/home/z/my-project/public/items'
PRICES_PATH = '/home/z/my-project/src/data/prices.json'
WIKI_BASE = 'https://dayr.wiki.gg/images/'
FAIL_LOG = '/home/z/my-project/scripts/failed_images.json'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
    'Referer': 'https://dayr.wiki.gg/',
}

# Manual overrides for items with non-standard wiki names
MANUAL = {
    'akm_c': ['AKM-C'], 'cho_ko_nu': ['Cho-ko-nu'], 'c_3_cologne': ['C-3_Cologne'],
    'd_eagle': ['Desert_Eagle'], 'ea_spectrum': ['EA_Spectrum'],
    'fatum_e_93': ['FATUM_E-93'], 'ir_190': ['IR-190'],
    'kalash_m': ['Kalash-M'], 'kalash_s': ['Kalash-S'],
    'pk_7_62_kraken': ['PK_7.62_Kraken'], 'vector_a': ['Vector-A'],
    'wolfsbane_1': ['Wolfsbane-1'], 'lidiacide_34': ['Lidiacide-34'],
    'biathlon_84': ['Biathlon-84'], 'erebus_273': ['Erebus-273'],
    'ulcer_amr': ['Ulcer_AMR'],
    'rpo_m_eye_of_the_storm': ['RPO-M_Eye_of_the_Storm'],
    'gp_4_gas_mask': ['GP-4_Gas_Mask'], 'gp_5_gas_mask': ['GP-5_Gas_Mask'],
    'gp_7_gas_mask': ['GP-7_Gas_Mask'], 'gp_2000_gas_mask': ['GP-2000_Gas_Mask'],
    'mm_1_gas_mask': ['MM-1_Gas_Mask'], 'ionica_gas_mask': ['Ionica_Gas_Mask'],
    'pmg_gas_mask': ['PMG_Gas_Mask'],
    'flashlight_10': ['Flashlight_(10%)'], 'flashlight_20': ['Flashlight_(20%)'],
    'flashlight_30': ['Flashlight_(30%)'],
    'strange_mushroom_black': ['Strange_mushroom_(Black)'],
    'strange_mushroom_blue': ['Strange_mushroom_(Blue)'],
    'strange_mushroom_green': ['Strange_mushroom_(Green)'],
    'strange_mushroom_light_blue': ['Strange_mushroom_(Light_Blue)'],
    'strange_mushroom_red': ['Strange_mushroom_(Red)'],
    'strange_mushroom_violet': ['Strange_mushroom_(Violet)'],
    'strange_mushroom_white': ['Strange_mushroom_(White)'],
    'strange_mushroom_yellow': ['Strange_mushroom_(Yellow)'],
    'gaz_24_broken': ['GAZ-24_(broken)'], 'kamaz_broken': ['KamAZ_(broken)'],
    'makarov_handgun_broken': ['Makarov_handgun_(broken)'],
    'mosin_nagant_rifle_broken': ['Mosin-Nagant_rifle_(broken)'],
    'nagant_revolver_broken': ['Nagant_Revolver_(broken)'],
    'pps_43_broken': ['PPS-43_(broken)'], 'ppsh_41_broken': ['PPSh-41_(broken)'],
    'rpk_74_broken': ['RPK-74_(broken)'], 'svt_40_broken': ['SVT-40_(broken)'],
    'tt_33_broken': ['TT-33_(broken)'], 'uaz_452_broken': ['UAZ-452_(broken)'],
    'uaz_469_broken': ['UAZ-469_(broken)'], 'vaz_2101_broken': ['VAZ-2101_(broken)'],
    'zaz_968_broken': ['ZAZ-968_(broken)'], 'zil_130_broken': ['ZIL-130_(broken)'],
    '7_62x25mm_tt_shell': ['7.62x25mm_TT_Shell'],
    'crossbow_bolt_poison': ['Crossbow_bolt_(poison)'],
    'survivor_s_cache': ["Survivor's_Cache"],
    'smuggler_s_flask': ["Smuggler's_Flask"],
    'sniper_s_mosin': ["Sniper's_Mosin"],
    'hunter_s_rifle': ["Hunter's_Rifle"],
    'hunter_s_garb': ["Hunter's_Garb"],
    'master_s_garb': ["Master's_Garb"],
    'butcher_s_backpack': ["Butcher's_Backpack"],
    'glutton_s_bag': ["Glutton's_Bag"],
    'forward_s_stick': ["Forward's_Stick"],
    'witch_s_punch': ["Witch's_Punch"],
    'dragon_s_roar': ["Dragon's_Roar"],
    't_800_bulletproof_vest': ['T-800_Bulletproof_Vest'],
    'chinese_bulletproof_vest': ['Chinese_Bulletproof_Vest'],
    'homemade_bulletproof_vest': ['Homemade_Bulletproof_Vest'],
    'ceramic_bulletproof_vest': ['Ceramic_Bulletproof_Vest'],
    'modern_bulletproof_vest': ['Modern_Bulletproof_Vest'],
    'primitive_bulletproof_vest': ['Primitive_Bulletproof_Vest'],
    'progress_bulletproof_vest': ['Progress_Bulletproof_Vest'],
    'army_bulletproof_vest': ['Army_Bulletproof_Vest'],
    'comcon_3_paste': ['ComCon-3_Paste'],
    'high_performance_capacitor': ['High-performance_Capacitor'],
    'jack_o_launcher': ["Jack_o'_Launcher"],
    'storm_snowball_launcher': ['Storm_Snowball_Launcher'],
    'icicle_thrower': ['Icicle_Thrower'], 'stake_thrower': ['Stake_Thrower'],
    'crouching_tiger': ['Crouching_Tiger'], 'hidden_dragon': ['Hidden_Dragon'],
    'flying_spaghetti_monster': ['Flying_Spaghetti_Monster'],
    'gasoline_engine': ['Gasoline_Engine'], 'chainsaw_motor': ['Chainsaw_motor'],
    'broken_car_battery': ['Broken_car_battery'], 'car_battery': ['Car_battery'],
    'battery_flashlight': ['Battery_flashlight'], 'catalysis_e': ['Catalysis-E'],
    'sanguinary_masha': ['Sanguinary_Masha'],
    'king_of_jokers': ['King_of_Jokers'], 'lotus_of_death': ['Lotus_of_Death'],
    'fear': ['Fear'], 'joker': ['Joker'], 'joy': ['Joy'], 'mayhem': ['Mayhem'],
    'midas': ['Midas'], 'revenge': ['Revenge'], 'termite': ['Termite'],
    'acidoemitter': ['Acidoemitter'], 'armorpiercer': ['Armorpiercer'],
    'bye_bye_rad': ['Bye-bye_Rad'],
    'chemistry_set': ['Chemistry_set'], 'weapon_box': ['Weapon_box'],
    'borschevik_flamethrower': ['Borschevik_Flamethrower'],
    'homemade_rocket_launcher': ['Homemade_Rocket_Launcher'],
    'homemade_smg': ['Homemade_SMG'],
    'single_shot_rifle': ['Single-Shot_Rifle'],
    'multi_shot_rifle': ['Multi-Shot_Rifle'],
    'pistol_silent': ['Pistol_Silent'],
    'pkm_broken': ['PKM_broken'], 'svd_broken': ['SVD_broken'],
    'bs_4_power_armor': ['BS-4_Power_Armor'],
    'rpg_vesuvius': ['RPG_Vesuvius'], 'cpe_leader': ['CPE_Leader'],
    'pas_weaver': ['PAS_Weaver'], 'sr_delirium': ['SR_Delirium'],
    'iron_felix': ['Iron_Felix'], 'law_guardian': ['Law_Guardian'],
    'fist_of_the_sky': ['Fist_of_the_Sky'],
    'infernal_prophet': ['Infernal_prophet'],
    'plague_doctor_s_mask': ["Plague_doctor's_Mask"],
    'smuggler_s_armor': ["Smuggler's_armor"],
    'prospector_s_armor': ["Prospector's_armor"],
}


def get_wiki_variants(item_id):
    """Return list of wiki name variants to try."""
    if item_id in MANUAL:
        return MANUAL[item_id]
    
    parts = item_id.split('_')
    # Title Case: Canned_Water
    title = '_'.join(p.capitalize() for p in parts)
    # Sentence case: Canned_water
    sentence = parts[0].capitalize() + '_' + '_'.join(parts[1:]) if len(parts) > 1 else parts[0].capitalize()
    
    variants = [title, sentence]
    # Deduplicate
    seen = set()
    result = []
    for v in variants:
        if v not in seen:
            seen.add(v)
            result.append(v)
    return result


def download_one(item_id):
    """Try to download image, converting WebP to PNG if needed."""
    output_path = os.path.join(ITEMS_DIR, item_id + '.png')
    variants = get_wiki_variants(item_id)
    
    for wiki_name in variants:
        url = WIKI_BASE + wiki_name + '.png'
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            resp = urllib.request.urlopen(req, timeout=10)
            data = resp.read()
            if len(data) < 50:
                continue
            
            # Check if it's actually an image (WebP, PNG, or JPEG)
            is_webp = data[:4] == b'RIFF'
            is_png = data[:4] == b'\x89PNG'
            is_jpeg = data[:2] == b'\xff\xd8'
            
            if not (is_webp or is_png or is_jpeg):
                continue
            
            # Convert to PNG
            try:
                img = Image.open(io.BytesIO(data))
                img.save(output_path, 'PNG')
                return (item_id, wiki_name, 'ok')
            except:
                # If PIL fails, save raw data
                with open(output_path, 'wb') as f:
                    f.write(data)
                return (item_id, wiki_name, 'raw')
        except urllib.error.HTTPError as e:
            if e.code == 404:
                continue
            return (item_id, wiki_name, 'err')
        except:
            return (item_id, wiki_name, 'err')
    
    return (item_id, variants[0] if variants else '?', 'fail')


def main():
    os.makedirs(ITEMS_DIR, exist_ok=True)
    with open(PRICES_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    items = []
    for cat in data['categories']:
        for item in cat['items']:
            items.append(item['id'])
    
    print(f'Downloading {len(items)} images (5 workers, WebP->PNG)...')
    ok_count = 0
    fail_list = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(download_one, iid): iid for iid in items}
        done = 0
        for future in concurrent.futures.as_completed(futures):
            done += 1
            item_id, wiki_name, status = future.result()
            if status in ('ok', 'raw'):
                ok_count += 1
            else:
                fail_list.append([item_id, wiki_name])
            if done % 50 == 0:
                print(f'  [{done}/{len(items)}] OK: {ok_count}, FAIL: {len(fail_list)}')
    
    print(f'\nDone! OK: {ok_count}, FAIL: {len(fail_list)}')
    if fail_list:
        print(f'\nFailed ({len(fail_list)}):')
        for fid, wn in fail_list:
            print(f'  {fid} -> {wn}')
        with open(FAIL_LOG, 'w') as f:
            json.dump(fail_list, f, indent=2)


if __name__ == '__main__':
    main()
