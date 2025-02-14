import { UploadStatus } from "@/components/UploadStatus"
import Mp4Icon from "@/icons/mp4"

export default function VideoPreviewer({ file, progress, index }) {
  return (
    <div className="px-4 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-900 flex items-center h-10 gap-2 rounded-md border border-gray-300 dark:border-neutral-700 contrast-more:border-gray-900 contrast-more:dark:border-gray-50">
      <Mp4Icon className="w-4 h-4" />
      <span className="text-sm w-56 truncate">{file.name}</span>
      <div className="flex-grow">
        <div className="overflow-x-hidden mx-auto max-w-72 text-xs flex rounded-full min-w-20">
          {progress[file.name] && progress[file.name].percent ? (
            // <div
            //   style={{ width: `${progress[file.name].percent}%` }}
            //   className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            // >
            //   <span className="relative left-0 right-0 w-full text-center text-blue-800"></span>
            // </div>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-x-hidden">
              <div
                style={{ width: `${progress[file.name].percent}%` }}
                className="h-full bg-primary-600"
              ></div>
            </div>
          ) : (
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-x-hidden">
              <div className="relative w-1/3 indicator h-full rounded-full bg-gradient-to-r from-gray-200 via-blue-500 to-gray-200 filter backdrop-blur-xs animate-gradient"></div>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs bg-gray-200 w-12 px-2 rounded-xl text-center">
        {`${progress[file.name].percent || 0}%`}
      </span>

      {progress[file.name] && progress[file.name].status && (
        <UploadStatus type={progress[file.name].status} />
      )}
    </div>
  )
}
