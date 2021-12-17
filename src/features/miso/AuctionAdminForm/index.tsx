import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'app/components/Button'
import {
  DiscordIcon,
  GithubIcon,
  MediumIcon,
  RedditIcon,
  TelegramIcon,
  TwitterIcon,
  WechatIcon,
} from 'app/components/Icon'
import Typography from 'app/components/Typography'
import AuctionAdminFormBannedCountries from 'app/features/miso/AuctionAdminForm/AuctionAdminFormBannedCountries'
import AuctionAdminFormSelect from 'app/features/miso/AuctionAdminForm/AuctionAdminFormSelect'
import AuctionAdminFormTextArea from 'app/features/miso/AuctionAdminForm/AuctionAdminFormTextArea'
import AuctionAdminFormTextField from 'app/features/miso/AuctionAdminForm/AuctionAdminFormTextField'
import AuctionAdminFormWhitelistSection from 'app/features/miso/AuctionAdminForm/AuctionAdminFormWhitelistSection'
import {
  imageSizeValidator,
  maxCharactersValidator,
  pipeline,
  urlValidator,
} from 'app/features/miso/AuctionAdminForm/validators'
import AuctionCard from 'app/features/miso/AuctionCard'
import { Auction } from 'app/features/miso/context/Auction'
import { DocumentInput } from 'app/features/miso/context/hooks/useAuctionDocuments'
import useAuctionEdit from 'app/features/miso/context/hooks/useAuctionEdit'
import { AuctionCategory, AuctionStatus } from 'app/features/miso/context/types'
import { classNames } from 'app/functions'
import { enumToArray } from 'app/functions/array/enumToArray'
import React, { FC, useCallback, useState } from 'react'

interface AuctionAdminFormProps {
  auction: Auction
}

const AuctionAdminForm: FC<AuctionAdminFormProps> = ({ auction }) => {
  const { i18n } = useLingui()

  const { editDocuments, cancelAuction } = useAuctionEdit(auction.auctionInfo.addr, auction.template)
  const [website, setWebsite] = useState<string>(auction.auctionDocuments.website)
  const [icon, setIcon] = useState<string>(auction.auctionDocuments.icon)
  const [description, setDescription] = useState<string>(auction.auctionDocuments.description)
  const [twitter, setTwitter] = useState<string>(auction.auctionDocuments.twitter)
  const [github, setGithub] = useState<string>(auction.auctionDocuments.github)
  const [telegram, setTelegram] = useState<string>(auction.auctionDocuments.telegram)
  const [wechat, setWechat] = useState<string>(auction.auctionDocuments.wechat)
  const [discord, setDiscord] = useState<string>(auction.auctionDocuments.discord)
  const [reddit, setReddit] = useState<string>(auction.auctionDocuments.reddit)
  const [medium, setMedium] = useState<string>(auction.auctionDocuments.medium)
  const [desktopBanner, setDesktopBanner] = useState<string>(auction.auctionDocuments.desktopBanner)
  const [mobileBanner, setMobileBanner] = useState<string>(auction.auctionDocuments.mobileBanner)
  const [category, setCategory] = useState<string>(auction.auctionDocuments.category)
  const [bannedCountries, setBannedCountries] = useState<string>(auction.auctionDocuments.bannedCountries)
  const [bannedWarning, setBannedWarning] = useState<string>(auction.auctionDocuments.bannedWarning)
  const [errors, setErrors] = useState<{}>({})

  const exampleAuction = new Auction({
    template: auction.template,
    auctionToken: auction.auctionToken,
    paymentToken: auction.paymentToken,
    auctionInfo: auction.auctionInfo,
    marketInfo: auction.marketInfo,
    auctionDocuments: {
      ...auction.auctionDocuments,
      description,
      website,
      icon,
      twitter,
      github,
      telegram,
      wechat,
      discord,
      reddit,
      medium,
      bannedCountries,
      bannedWarning,
      desktopBanner,
      mobileBanner,
      category,
    },
    whitelist: auction.whitelist,
  })

  const hasErrors = Object.values(errors).filter((el) => !!el).length > 0
  const setError = useCallback((val) => {
    setErrors((prevState) => ({
      ...prevState,
      ...val,
    }))
  }, [])

  const save = useCallback(() => {
    if (hasErrors) {
      return console.error('Invalid form inputs')
    }

    const currentDocs = { ...auction.auctionDocuments }
    const newDocs = { ...exampleAuction.auctionDocuments }
    const diff = Object.entries(newDocs).reduce<DocumentInput[]>((acc, [k, v]) => {
      if (currentDocs[k] !== newDocs[k]) {
        acc.push({ name: k, data: v })
      }

      return acc
    }, [])

    editDocuments(diff)
  }, [auction.auctionDocuments, exampleAuction.auctionDocuments, hasErrors, editDocuments])

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex flex-col gap-10">
        <div className="bg-dark-900 p-10 rounded space-y-8 divide-y divide-dark-700 shadow-xl shadow-red/5">
          <div className="space-y-8 divide-y divide-dark-700">
            <div>
              <div className="flex flex-col gap-1">
                <Typography variant="lg" className="text-high-emphesis" weight={700}>
                  {i18n._(t`Project Details`)}
                </Typography>
                <Typography variant="sm" weight={400}>
                  {i18n._(
                    t`Only the Auction admin and approved operators for this auction are able to edit any of the details below. Do not waste your gas.`
                  )}
                </Typography>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-y-6 gap-x-4">
                <div className="col-span-3">
                  <AuctionAdminFormTextField
                    error={errors['website']}
                    label={i18n._(t`Website`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setWebsite(e.target.value),
                        (e) => setError({ website: e })
                      )
                    }
                    placeholder="https://example.com"
                    value={website}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {i18n._(t`Please note that the URL must use https.`)}
                      </p>
                    }
                  />
                </div>
                <div className="col-span-3">
                  <AuctionAdminFormSelect
                    error={errors['category']}
                    label={i18n._(t`Category`)}
                    options={enumToArray(AuctionCategory)}
                    onChange={(value) =>
                      pipeline(
                        { value, maxCharactersThreshold: 300, imageSizeThreshold: 250000 },
                        [],
                        () => setCategory(value),
                        (e) => setError({ category: e })
                      )
                    }
                    value={category}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {i18n._(
                          t`Setting a category will increase your project's findability. Please message us if you feel like your project doesn't fit in any of the categories.`
                        )}
                      </p>
                    }
                  />
                </div>
                <div className="col-span-3">
                  <AuctionAdminFormTextField
                    error={errors['icon']}
                    label={i18n._(t`Icon`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300, imageSizeThreshold: 250000 },
                        [urlValidator, imageSizeValidator, maxCharactersValidator],
                        () => setIcon(e.target.value),
                        (e) => setError({ icon: e })
                      )
                    }
                    placeholder="https://example.com/icon.png"
                    value={icon}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {i18n._(
                          t`Icon image must be smaller than 250kB, this is to keep page load optimized. Icon dimensions preferably 128x128 or smaller`
                        )}
                      </p>
                    }
                  />
                </div>
                <div className="col-span-3">
                  <AuctionAdminFormTextField
                    error={errors['desktopBanner']}
                    label={i18n._(t`Desktop Banner`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300, imageSizeThreshold: 250000 },
                        [urlValidator, imageSizeValidator, maxCharactersValidator],
                        () => setDesktopBanner(e.target.value),
                        (e) => setError({ desktopBanner: e })
                      )
                    }
                    placeholder="https://example.com/icon.png"
                    value={desktopBanner}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {i18n._(
                          t`Desktop banner must be smaller than 250kB, this is to keep page load optimized. Desktop banner dimensions preferably 1280x196 or a similar ratio`
                        )}
                      </p>
                    }
                  />
                </div>
                <div className="col-span-3">
                  <AuctionAdminFormTextField
                    error={errors['mobileBanner']}
                    label={i18n._(t`Mobile Banner`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300, imageSizeThreshold: 250000 },
                        [urlValidator, maxCharactersValidator],
                        () => setMobileBanner(e.target.value),
                        (e) => setError({ mobileBanner: e })
                      )
                    }
                    placeholder="https://example.com/icon.png"
                    value={mobileBanner}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {i18n._(
                          t`Mobile banner must be smaller than 250kB, this is to keep page load optimized. Desktop banner dimensions preferably 768x196 or a similar ratio`
                        )}
                      </p>
                    }
                  />
                </div>
                <div className="col-span-3">
                  <AuctionAdminFormTextArea
                    error={errors['description']}
                    label={i18n._(t`Description`)}
                    rows={3}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [maxCharactersValidator],
                        () => setDescription(e.target.value),
                        (e) => setError({ description: e })
                      )
                    }
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {description
                          ? `${description.length} / 300 Characters`
                          : i18n._(t`Summary of your project in at most 300 characters`)}
                      </p>
                    }
                    value={description}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div className="flex flex-col gap-1">
                <Typography variant="lg" className="text-high-emphesis" weight={700}>
                  {i18n._(t`Socials`)}
                </Typography>
                <Typography variant="sm" weight={400}>
                  {i18n._(t`Please note that all social links must use https. Each social link will be displayed with their
                corresponding brand icon`)}
                </Typography>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <AuctionAdminFormTextField
                    icon={<TwitterIcon width={20} />}
                    error={errors['twitter']}
                    label={i18n._(t`Twitter`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setTwitter(e.target.value),
                        (e) => setError({ twitter: e })
                      )
                    }
                    placeholder="https://twitter.com"
                    value={twitter}
                    helperText={<p className="mt-2 text-sm text-gray-500">{i18n._(t`Link to your Twitter profile`)}</p>}
                  />
                </div>

                <div className="sm:col-span-6">
                  <AuctionAdminFormTextField
                    icon={<GithubIcon width={20} />}
                    error={errors['github']}
                    label={i18n._(t`Github`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setGithub(e.target.value),
                        (e) => setError({ github: e })
                      )
                    }
                    placeholder="https://github.com"
                    value={github}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">{i18n._(t`Link to your Github repository`)}</p>
                    }
                  />
                </div>

                <div className="sm:col-span-6">
                  <AuctionAdminFormTextField
                    icon={<TelegramIcon width={20} />}
                    error={errors['telegram']}
                    label={i18n._(t`Telegram`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setTelegram(e.target.value),
                        (e) => setError({ telegram: e })
                      )
                    }
                    placeholder="https://telegram.com"
                    value={telegram}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">{i18n._(t`Link to your Telegram group chat`)}</p>
                    }
                  />
                </div>

                <div className="sm:col-span-6">
                  <AuctionAdminFormTextField
                    icon={<WechatIcon width={20} />}
                    error={errors['wechat']}
                    label={i18n._(t`Wechat`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setWechat(e.target.value),
                        (e) => setError({ wechat: e })
                      )
                    }
                    placeholder="https://wechat.com"
                    value={wechat}
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">{i18n._(t`Link to your WeChat group chat`)}</p>
                    }
                  />
                </div>

                <div className="sm:col-span-6">
                  <AuctionAdminFormTextField
                    icon={<DiscordIcon width={20} />}
                    error={errors['discord']}
                    label={i18n._(t`Discord`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setDiscord(e.target.value),
                        (e) => setError({ discord: e })
                      )
                    }
                    placeholder="https://discord.gg"
                    value={discord}
                    helperText={<p className="mt-2 text-sm text-gray-500">{i18n._(t`Your Discord invite link`)}</p>}
                  />
                </div>

                <div className="sm:col-span-6">
                  <AuctionAdminFormTextField
                    icon={<RedditIcon width={20} />}
                    error={errors['reddit']}
                    label={i18n._(t`Reddit`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setReddit(e.target.value),
                        (e) => setError({ reddit: e })
                      )
                    }
                    placeholder="https://reddit.com"
                    value={reddit}
                    helperText={<p className="mt-2 text-sm text-gray-500">{i18n._(t`Link to your Reddit board`)}</p>}
                  />
                </div>

                <div className="sm:col-span-6">
                  <AuctionAdminFormTextField
                    icon={<MediumIcon width={20} />}
                    error={errors['medium']}
                    label={i18n._(t`Medium`)}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [urlValidator, maxCharactersValidator],
                        () => setMedium(e.target.value),
                        (e) => setError({ medium: e })
                      )
                    }
                    placeholder="https://medium.com"
                    value={medium}
                    helperText={<p className="mt-2 text-sm text-gray-500">{i18n._(t`Link to your Medium account`)}</p>}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div className="flex flex-col gap-1">
                <Typography variant="lg" className="text-high-emphesis" weight={700}>
                  {i18n._(t`Settings`)}
                </Typography>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <AuctionAdminFormBannedCountries
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {i18n._(t`Select countries who are not allowed to participate in this auction. Please note that this does
                        not prevent users from actually committing but merely serves as a disclaimer.`)}
                      </p>
                    }
                    label={i18n._(t`Country Ban`)}
                    onChange={(value) =>
                      pipeline(
                        { value, maxCharactersThreshold: 300 },
                        [maxCharactersValidator],
                        () => setBannedCountries(value),
                        (e) => setError({ bannedCountries: e })
                      )
                    }
                    value={bannedCountries}
                  />
                </div>

                <div className="sm:col-span-6">
                  <AuctionAdminFormTextArea
                    error={errors['bannedWarning']}
                    label={i18n._(t`Warning Message`)}
                    rows={7}
                    onChange={(e) =>
                      pipeline(
                        { value: e.target.value, maxCharactersThreshold: 300 },
                        [maxCharactersValidator],
                        () => setBannedWarning(e.target.value),
                        (e) => setError({ bannedWarning: e })
                      )
                    }
                    placeholder="The content contained in this website does not constitute an offer or sale of securities in or into the United States, or to or for the account or benefit of U.S. persons, or in any other jurisdictions where it is unlawful to do so. Transfer of BIT tokens may be subject to legal restrictions under applicable laws. Under no circumstances shall BIT tokens be reoffered, resold or transferred within the United States or to, or for the account or benefit of, U.S. persons, except pursuant to an exemption from, or in a transaction not subject to, the registration requirements of the U.S. Securities Act of 1933, as amended."
                    helperText={
                      <p className="mt-2 text-sm text-gray-500">
                        {bannedWarning
                          ? `${bannedWarning.length} / 300 Characters`
                          : i18n._(t`Legal warning for your project in at most 300 characters`)}
                      </p>
                    }
                    value={bannedWarning}
                  />
                </div>
              </div>
            </div>
            <div className="pt-8">
              <div className="flex flex-col gap-1">
                <Typography variant="lg" className="text-high-emphesis" weight={700}>
                  {i18n._(t`Danger Zone`)}
                </Typography>
              </div>
              <div
                className={classNames(
                  auction.status !== AuctionStatus.UPCOMING ? 'border-dark-800' : 'border-red/50 hover:border-red/100',
                  'mt-6 w-1/3 border rounded p-5'
                )}
              >
                <div className="sm:col-span-2">
                  <Button
                    onClick={cancelAuction}
                    variant="empty"
                    role="button"
                    className={classNames(
                      auction.status !== AuctionStatus.UPCOMING ? '!text-low-emphesis' : '!text-red'
                    )}
                    disabled={auction.status !== AuctionStatus.UPCOMING}
                  >
                    {i18n._(t`Cancel this auction`)}
                  </Button>
                  <p
                    className={classNames(
                      auction.status !== AuctionStatus.UPCOMING ? 'text-low-emphesis' : 'text-red',
                      'mt-2 text-sm '
                    )}
                  >
                    {i18n._(t`Once you cancel an auction, there is no going back. Please be certain.`)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {auction.status !== AuctionStatus.UPCOMING
                  ? i18n._(t`Auction is past start date`)
                  : i18n._(t`Auction can only be cancelled by the admin before the start date`)}
              </p>
            </div>
          </div>

          <div className="pt-8">
            <div className="flex justify-end">
              <div>
                <Button disabled={hasErrors} onClick={save} color="blue">
                  {hasErrors ? i18n._(t`Invalid inputs`) : i18n._(t`Save`)}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 p-10 rounded space-y-8 divide-y divide-dark-700 shadow-xl shadow-red/5">
          <AuctionAdminFormWhitelistSection auction={auction} />
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-1">
          <Typography variant="lg" className="text-high-emphesis" weight={700}>
            {i18n._(t`Example Card`)}
          </Typography>
        </div>
        <div className="mt-3 sticky top-[104px] w-[296px] h-[430px]" role="button">
          <AuctionCard auction={exampleAuction} link={false} />
        </div>
      </div>
    </div>
  )
}

export default AuctionAdminForm